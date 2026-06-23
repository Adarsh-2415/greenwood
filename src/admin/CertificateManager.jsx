// src/admin/CertificateManager.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from './adminApi.js';
import { 
  FiSearch, FiPlus, FiTrash2, FiEdit2, FiX, 
  FiEye, FiCalendar, FiUpload, FiFileText, FiDownload, FiAlertCircle 
} from 'react-icons/fi';

export const CertificateManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal open states
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCert, setEditingCert] = useState(null);

  // Form fields state
  const [studentName, setStudentName] = useState('');
  const [dob, setDob] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [tcNumber, setTcNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');

  // PDF Preview drawer
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');

  const fetchCertificates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listCertificates(search, page);
      setCertificates(data.certificates || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message || 'Failed to retrieve transfer certificates list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [search, page]);

  const handleEditClick = (cert) => {
    setEditingCert(cert);
    setStudentName(cert.student_name);
    setDob(cert.dob);
    setAdmissionNumber(cert.admission_number);
    setTcNumber(cert.tc_number);
    setIssueDate(cert.issue_date);
    setExistingPdfUrl(cert.pdf_path);
    setPdfFile(null);
    setFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingCert(null);
    setStudentName('');
    setDob('');
    setAdmissionNumber('');
    setTcNumber('');
    setIssueDate('');
    setExistingPdfUrl('');
    setPdfFile(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!studentName || !dob || !admissionNumber || !tcNumber || !issueDate) {
      setError('Please fill in all text fields');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('student_name', studentName);
      formData.append('dob', dob);
      formData.append('admission_number', admissionNumber);
      formData.append('tc_number', tcNumber);
      formData.append('issue_date', issueDate);
      
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      } else if (existingPdfUrl) {
        formData.append('pdf_url', existingPdfUrl);
      } else {
        setError('Please choose or upload a certificate PDF file');
        setSubmitting(false);
        return;
      }

      if (editingCert) {
        await adminApi.updateCertificate(editingCert.id, formData);
        alert('Certificate updated successfully');
      } else {
        await adminApi.createCertificate(formData);
        alert('Transfer Certificate added successfully');
      }

      setFormOpen(false);
      fetchCertificates();
    } catch (err) {
      setError(err.message || 'Failed to save transfer certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete transfer certificate for student "${name}"? This action is permanent.`)) {
      return;
    }
    try {
      await adminApi.deleteCertificate(id);
      fetchCertificates();
    } catch (err) {
      alert(err.message || 'Failed to delete certificate');
    }
  };

  return (
    <div className="space-y-6 select-none relative">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Transfer Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage student transfer certificates, upload PDFs, and manage student registry lookup keys.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Certificate</span>
        </button>
      </div>

      {/* Filter / Search dashboard row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 border border-gray-150 rounded-2xl shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by student name or certificate number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white border border-gray-200 focus:border-amber-500/50 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold outline-none focus:ring-4 focus:ring-amber-500/5"
          />
        </div>
      </div>

      {/* Main content table list */}
      {loading ? (
        <div className="w-full h-[40vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-gray-450 text-sm">Querying certificates registry...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-bold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Date of Birth</th>
                  <th className="px-6 py-4">Admission No.</th>
                  <th className="px-6 py-4">Certificate No.</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-800">{c.student_name}</td>
                    <td className="px-6 py-4 flex items-center gap-1 text-gray-650">
                      <FiCalendar className="text-gray-400" />
                      <span>{new Date(c.dob).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{c.admission_number}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{c.tc_number}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(c.issue_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => setPreviewPdfUrl(c.pdf_path)}
                        className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-indigo-50 text-indigo-650 border border-gray-150 hover:border-indigo-200 rounded-lg transition-colors cursor-pointer"
                        title="View PDF Preview"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(c)}
                        className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-600 border border-gray-150 hover:border-amber-200 rounded-lg transition-colors cursor-pointer"
                        title="Edit details"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.student_name)}
                        className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-red-50 text-red-650 border border-gray-150 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                        title="Delete Certificate"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {certificates.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">
                      No transfer certificates recorded in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination row */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 select-none">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-650 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500 font-semibold mx-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-650 bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* ADD / EDIT TRANS CERTIFICATE MODAL FORM */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none">
          <div className="w-full max-w-lg bg-white border border-gray-250 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
            
            <div className="p-6 border-b border-gray-150 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-gray-800">
                {editingCert ? 'Edit Certificate Details' : 'Add Transfer Certificate'}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="p-1.5 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-lg text-gray-500 cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-sm">
              
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-800 text-sm">
                  <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-semibold"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Admission Number</label>
                  <input
                    type="text"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none"
                    placeholder="e.g. GR-2020-04"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Certificate Number</label>
                  <input
                    type="text"
                    value={tcNumber}
                    onChange={(e) => setTcNumber(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none focus:border-amber-500/50 font-mono"
                    placeholder="e.g. TC-9923"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-xl py-2 px-3 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Certificate PDF File</label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50 hover:bg-gray-100/50 transition-colors relative cursor-pointer flex flex-col items-center justify-center">
                  <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs font-semibold text-gray-600 block">
                    {pdfFile ? pdfFile.name : (existingPdfUrl ? 'Existing PDF Linked (Click to Replace)' : 'Click to Upload PDF')}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1">Accepts only .pdf formats</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl transition-colors shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Save Certificate'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* PDF LIVE PREVIEW SIDEBAR DRAWER */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 select-none">
          <div className="w-full max-w-2xl bg-white border-l border-gray-250 h-full flex flex-col animate-slideLeft">
            <div className="p-6 border-b border-gray-150 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <FiFileText className="w-6 h-6 text-amber-500" />
                <h3 className="font-serif text-lg font-bold">Preview Certificate</h3>
              </div>
              <button
                onClick={() => setPreviewPdfUrl('')}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            {/* Embedded IFrame PDF Viewer */}
            <div className="flex-1 bg-gray-100 p-4">
              <iframe
                src={previewPdfUrl}
                title="Transfer Certificate Preview"
                className="w-full h-full border border-gray-200 rounded-2xl shadow-inner"
              />
            </div>
            
            <div className="p-5 border-t border-gray-150 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold font-mono truncate max-w-xs">{previewPdfUrl}</span>
              <a
                href={previewPdfUrl}
                download
                className="flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                <FiDownload />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CertificateManager;
