/** @format */

import { X } from "lucide-react";

interface Holiday {
  title: string;
  date: string;
  day: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  holiday: Holiday | null;
}

const ViewHolidayModal = ({ isOpen, onClose, holiday }: Props) => {
  if (!isOpen || !holiday) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* MODAL */}
      <div
        className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-center text-xl font-semibold">
          Holiday Details
        </h2>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-500">Holiday</p>
            <p className="font-medium text-orange-500">{holiday.title}</p>
          </div>

          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">
              {new Date(holiday.date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Day</p>
            <p className="font-medium">{holiday.day}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHolidayModal;
