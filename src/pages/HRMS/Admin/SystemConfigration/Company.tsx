/** @format */

import { useEffect, useState } from "react";
import axios from "axios";
import { MoreVertical } from "lucide-react";
import CompanyModal from "./CompanyModal";
import DeleteCompanyModal from "./DeleteCompanyModel";

const API_BASE = import.meta.env.VITE_API_URL;

export interface Company {
  _id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  address: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export default function Company() {
  const token = localStorage.getItem("token");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"add" | "view" | "edit">("add");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // ✅ DELETE MODAL STATES
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ✅ ACTUAL DELETE API
  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    await axios.delete(`${API_BASE}/companies/${companyToDelete._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOpenDeleteModal(false);
    setCompanyToDelete(null);
    fetchCompanies();
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-sm text-gray-500">
            System Configuration / Company
          </p>
        </div>

        <button
          onClick={() => {
            setMode("add");
            setSelectedCompany(null);
            setOpenModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-md font-medium hover:bg-orange-600"
        >
          + Add Company
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow min-h-[calc(100vh-180px)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Company Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created On</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              companies.map((company, i) => (
                <tr key={company._id} className="border-t">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{company.name}</td>
                  <td className="px-4 py-3">{company.email}</td>
                  <td className="px-4 py-3">{company.phone}</td>
                  <td className="px-4 py-3">{company.industry}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        company.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {company.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>

                  {/* ACTION */}
                  <td className="px-4 py-3 text-center relative">
                    <span
                      className="cursor-pointer"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === company._id ? null : company._id
                        )
                      }
                    >
                      <MoreVertical size={18} />
                    </span>

                    {openMenu === company._id && (
                      <div className="absolute right-6 mt-2 w-36 bg-white border rounded-md shadow z-50">
                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => {
                            setMode("view");
                            setSelectedCompany(company);
                            setOpenModal(true);
                            setOpenMenu(null);
                          }}
                        >
                          View
                        </button>

                        <button
                          className="w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => {
                            setMode("edit");
                            setSelectedCompany(company);
                            setOpenModal(true);
                            setOpenMenu(null);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50"
                          onClick={() => {
                            setCompanyToDelete(company);
                            setOpenDeleteModal(true);
                            setOpenMenu(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ADD / VIEW / EDIT MODAL */}
      <CompanyModal
        isOpen={openModal}
        mode={mode}
        company={selectedCompany}
        onClose={() => {
          setOpenModal(false);
          fetchCompanies();
        }}
      />

      {/* DELETE CONFIRM MODAL */}
      <DeleteCompanyModal
        isOpen={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setCompanyToDelete(null);
        }}
        onConfirm={handleDeleteCompany}
        companyName={companyToDelete?.name}
      />
    </div>
  );
}
