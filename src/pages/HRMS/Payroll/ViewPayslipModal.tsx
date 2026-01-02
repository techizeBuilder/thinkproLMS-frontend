/** @format */
const ViewPayslipModal = ({ data, onClose, onDownload }: any) => {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Payslip –{" "}
          {new Date(data.month).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        {/* INFO */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500">Employee</p>
            <p className="font-medium">{data.employeeName}</p>
          </div>
          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-medium">{data.department}</p>
          </div>
        </div>

        {/* SALARY TABLE */}
        <div className="border rounded-md overflow-hidden text-sm">
          <table className="w-full">
            <tbody>
              <tr className="bg-gray-50">
                <td className="p-2 font-medium">Basic Pay</td>
                <td className="p-2 text-right">₹{data.basic}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">HRA</td>
                <td className="p-2 text-right">₹{data.hra}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2 font-medium">Allowances</td>
                <td className="p-2 text-right">₹{data.allowance}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Deductions</td>
                <td className="p-2 text-right">₹{data.deduction}</td>
              </tr>
              <tr className="bg-green-50 font-semibold">
                <td className="p-2">Net Pay</td>
                <td className="p-2 text-right text-green-700">
                  ₹{data.netSalary}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-md text-sm"
          >
            Close
          </button>
          <button
            onClick={onDownload}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPayslipModal;
