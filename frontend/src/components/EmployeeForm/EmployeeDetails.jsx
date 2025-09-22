import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Document, Page, pdfjs } from "react-pdf";

// Set the worker BEFORE using <Document />
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const EmployeeDetails = ({ employeeId, onClose }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({}); // track download state per file

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);

        const [profileRes, bankRes] = await Promise.all([
          axiosInstance.get(`/employee/${employeeId}`),
          axiosInstance
            .get(`/employee/bank/${employeeId}`)
            .catch((err) => {
              if (err.response?.status === 404) return { data: null };
              throw err;
            }),
        ]);

        setEmployee({
          ...profileRes.data.data,
          bankDetails: bankRes.data,
        });
      } catch (err) {
        console.error("Error fetching employee details:", err);
        alert("Error loading employee details");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchEmployeeDetails();
  }, [employeeId]);

  const getFilenameFromUrl = (url) => {
    try {
      return url.split("/").pop().split("?")[0];
    } catch {
      return "document.pdf";
    }
  };

  // const handleDownload = (url, fileName, index) => {
  //   if (!url) return alert("File URL not found");

  //   setDownloading((prev) => ({ ...prev, [index]: true }));

  //   try {
  //     const link = document.createElement("a");
  //     link.href = url; // Cloudinary public URL
  //     link.download = fileName || getFilenameFromUrl(url);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //     window.open(url, "_blank");
  //   } finally {
  //     setDownloading((prev) => ({ ...prev, [index]: false }));
  //   }
  // };

  const handleDownload = async (url, fileName, index) => {
  setDownloading((prev) => ({ ...prev, [index]: true }));

  try {
    // Axios fetch with blob
    const response = await axiosInstance.get(url, { responseType: "blob" });

    const blob = new Blob([response.data], { type: response.data.type });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || url.split("/").pop();
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Download failed. Please try again.");
  } finally {
    setDownloading((prev) => ({ ...prev, [index]: false }));
  }
};


  function PDFViewer({ url }) {
    const [numPages, setNumPages] = useState(null);

    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

    return (
      <div className="pdf-viewer border rounded p-2">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading="Loading PDF..."
          onLoadError={(err) => console.log("PDF load error:", err)}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page key={index} pageNumber={index + 1} />
          ))}
        </Document>
      </div>
    );
  }

  if (loading)
    return (
      <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104774]"></div>
          </div>
        </div>
      </div>
    );

  if (!employee)
    return (
      <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6">
          <div className="text-center py-8">
            <p className="text-red-500">Employee not found</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Employee Details - {employee.firstName} {employee.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal & Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#104774]">
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium w-32">Employee ID:</span>
                  <span className="text-gray-700">{employee.employeeId}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Name:</span>
                  <span className="text-gray-700">
                    {employee.firstName} {employee.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Email:</span>
                  <span className="text-gray-700">{employee.user?.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Phone:</span>
                  <span className="text-gray-700">{employee.phone || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Date of Birth:</span>
                  <span className="text-gray-700">
                    {employee.dob
                      ? new Date(employee.dob).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Gender:</span>
                  <span className="text-gray-700 capitalize">
                    {employee.gender || "N/A"}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium w-32">Address:</span>
                  <span className="text-gray-700 flex-1">
                    {employee.address || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Job Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-[#104774]">
                Job Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium w-32">Department:</span>
                  <span className="text-gray-700">{employee.department || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Designation:</span>
                  <span className="text-gray-700">{employee.designation || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Date of Joining:</span>
                  <span className="text-gray-700">
                    {employee.dateOfJoining
                      ? new Date(employee.dateOfJoining).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Employment Type:</span>
                  <span className="text-gray-700 capitalize">
                    {employee.employmentType?.replace("-", " ") || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Work Mode:</span>
                  <span className="text-gray-700 capitalize">
                    {employee.workMode?.replace(/-/g, " ") || "N/A"}
                  </span>
                </div>
                {employee.shiftTiming?.start || employee.shiftTiming?.end ? (
                  <div className="flex items-center">
                    <span className="font-medium w-32">Shift Timing:</span>
                    <span className="text-gray-700">
                      {employee.shiftTiming.start && employee.shiftTiming.end
                        ? `${employee.shiftTiming.start} - ${employee.shiftTiming.end}`
                        : "N/A"}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center">
                  <span className="font-medium w-32">Role:</span>
                  <span className="text-gray-700 capitalize">{employee.user?.role || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-32">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      employee.user?.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {employee.user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank & Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {employee.bankDetails && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-[#104774]">Bank Details</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-center">
                    <span className="font-medium w-36">Account Holder:</span>
                    <span className="font-semibold">{employee.bankDetails.accountHolderName}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-36">Account Number:</span>
                    <span className="font-semibold">{employee.bankDetails.accountNumber}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-36">Bank Name:</span>
                    <span className="font-semibold">{employee.bankDetails.bankName}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-36">IFSC Code:</span>
                    <span className="font-semibold">{employee.bankDetails.ifscCode}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-36">Account Type:</span>
                    <span className="font-semibold">{employee.bankDetails.accountType}</span>
                  </div>
                </div>
              </div>
            )}

            {employee.documents?.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-[#104774]">Documents</h3>
                <div className="space-y-2">
                  {employee.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                      <span className="text-sm text-gray-700 truncate">{doc.name || getFilenameFromUrl(doc.url)}</span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleDownload(doc.url, doc.name, index)}
                          disabled={downloading?.[index]}
                          className="text-[#104774] hover:underline text-sm font-medium"
                        >
                          {downloading?.[index] ? "Downloading..." : "Download"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-xl text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
