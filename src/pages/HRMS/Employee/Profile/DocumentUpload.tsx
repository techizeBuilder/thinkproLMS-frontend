/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Upload, Eye, CheckCircle, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const ViewAPI = "http://localhost:8000";

/* ================= TYPES ================= */

type DocumentType = "AADHAAR" | "PAN" | "MARKSHEET_12" | "PASSBOOK";

interface UserDocument {
  _id: string;
  type: DocumentType;
  fileUrl: string;
  status: "UPLOADED" | "VERIFIED" | "REJECTED";
  createdAt: string;
}

interface UserType {
  _id: string;
  name: string;
  employeeId: string;
  designationId?: { name: string };
  departmentId?: { name: string };
}

/* ================= REQUIRED DOCUMENTS ================= */

const REQUIRED_DOCUMENTS: {
  key: DocumentType;
  label: string;
  field: string;
}[] = [
  { key: "AADHAAR", label: "Aadhaar Card", field: "aadhaar" },
  { key: "PAN", label: "PAN Card", field: "pan" },
  { key: "MARKSHEET_12", label: "Marksheet", field: "marksheet10" },
  { key: "PASSBOOK", label: "Bank Passbook", field: "passbook" },
];

/* ================= COMPONENT ================= */

export default function DocumentUpload() {
  const token = localStorage.getItem("token");
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = loggedInUser?.id;

  const [user, setUser] = useState<UserType | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  /* ================= FETCH USER ================= */

  const fetchUser = async () => {
    const res = await axios.get(`${API}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data);
  };

  /* ================= FETCH DOCUMENTS ================= */

  const fetchDocuments = async () => {
    const res = await axios.get(`${API}/documents/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDocuments(res.data);
  };

  useEffect(() => {
    Promise.all([fetchUser(), fetchDocuments()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const getDocument = (type: DocumentType) =>
    documents.find((d) => d.type === type);

  /* ================= UPLOAD HANDLER ================= */

const handleUpload = async (file: File, field: string, type: DocumentType) => {
  try {
    setUploading(field);

    const formData = new FormData();
    formData.append(field, file);

    const existingDoc = getDocument(type);

    // ✅ IF DOCUMENT ALREADY EXISTS → UPDATE (PUT)
    if (existingDoc) {
      await axios.put(`${API}/documents/update/${existingDoc._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    }
    // ✅ FIRST TIME UPLOAD → CREATE (POST)
    else {
      await axios.post(`${API}/documents/upload/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
    }

    await fetchDocuments();
  } catch (error) {
    console.error("Upload failed", error);
  } finally {
    setUploading(null);
  }
};


  /* ================= UI STATES ================= */

  if (loading) {
    return <div className="p-6 text-gray-500">Loading documents...</div>;
  }

  if (!user) {
    return <div className="p-6 text-red-500">User not found</div>;
  }

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  /* ================= UI ================= */

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Mandatory Document Upload</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ================= USER INFO ================= */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-xl shadow-sm p-6 text-center sticky top-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold">
              {initials}
            </div>

            <h2 className="mt-4 text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.employeeId}</p>

            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>{user.designationId?.name}</p>
              <p>{user.departmentId?.name}</p>
            </div>
          </div>
        </div>

        {/* ================= DOCUMENT LIST ================= */}
        <div className="lg:col-span-3 space-y-4">
          {REQUIRED_DOCUMENTS.map((doc) => {
            const uploadedDoc = getDocument(doc.key);
            const isUploaded = !!uploadedDoc;

            return (
              <div
                key={doc.key}
                className="bg-white border rounded-xl shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                {/* LEFT */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-100">
                    <FileText className="text-gray-600" />
                  </div>

                  <div>
                    <h3 className="font-medium">{doc.label}</h3>

                    {isUploaded ? (
                      <div className="flex items-center gap-2 text-sm text-green-600 mt-1">
                        <CheckCircle size={16} />
                        Uploaded
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-yellow-600 mt-1">
                        <AlertCircle size={16} />
                        Pending
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex gap-2">
                  {/* VIEW – only if uploaded */}
                  {isUploaded && (
                    <a
                      href={`${ViewAPI}/${uploadedDoc.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                      <Eye size={16} />
                      View
                    </a>
                  )}

                  {/* UPLOAD – always visible */}
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                    <Upload size={16} />
                    {uploading === doc.field ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      hidden
                      onChange={(e) =>
                        e.target.files &&
                        handleUpload(e.target.files[0], doc.field, doc.key)
                      }
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
