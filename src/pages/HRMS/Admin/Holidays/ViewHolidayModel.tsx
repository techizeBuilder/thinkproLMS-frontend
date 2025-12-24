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
    <>
      {/* Blur Overlay */}
      <div
        className="fixed inset-0 backdrop-blur-[2px] z-30"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="bg-white w-[420px] rounded-lg shadow-xl relative p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>

          {/* Heading */}
          <h2 className="text-xl font-semibold mb-6 text-center">
            Holiday Details
          </h2>

          {/* Details */}
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
    </>
  );
};

export default ViewHolidayModal;
