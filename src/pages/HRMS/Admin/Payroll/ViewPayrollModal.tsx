/** @format */

interface PayslipData {
  name: string;
  month: string;
  gross: number;
  deduction: number;
  net: number;
  attendanceDays: number;
  absentDays: number;
  paidLeaves: number;
  unpaidLeaves: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: PayslipData | null;
}

const ViewPayrollModal = ({ isOpen, onClose, data }: Props) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[720px] rounded-xl shadow-xl p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Payslip – {data.month}
            </h2>
            <p className="text-sm text-gray-500">{data.name}</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Salary */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-700">
              💰 Salary Details
            </h3>

            <div className="flex justify-between text-sm mb-2">
              <span>Gross Salary</span>
              <span>₹{data.gross}</span>
            </div>

            <div className="flex justify-between text-sm mb-2 text-red-500">
              <span>Total Deduction</span>
              <span>₹{data.deduction}</span>
            </div>

            <div className="flex justify-between font-semibold text-green-600">
              <span>Net Pay</span>
              <span>₹{data.net}</span>
            </div>
          </div>

          {/* Attendance */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-700">
              🕒 Attendance Summary
            </h3>

            <div className="flex justify-between text-sm mb-2">
              <span>Present Days</span>
              <span>{data.attendanceDays}</span>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <span>Absent Days</span>
              <span>{data.absentDays}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Paid Leaves</span>
              <span>{data.paidLeaves}</span>
            </div>

            <div className="flex justify-between text-sm text-red-500 mt-1">
              <span>Unpaid Leaves</span>
              <span>{data.unpaidLeaves}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>

          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
            Download Payslip
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPayrollModal;
