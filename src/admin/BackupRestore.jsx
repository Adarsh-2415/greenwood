// src/admin/BackupRestore.jsx
import React, { useState, useEffect } from 'react';
import { adminApi } from './adminApi.js';
import { 
  FiDatabase, FiDownload, FiTrash2, FiRefreshCw, 
  FiPlus, FiUpload, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';

export const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected file for manual restore upload
  const [restoreFile, setRestoreFile] = useState(null);

  const fetchBackups = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.listBackups();
      setBackups(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve database backups list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setActionLoading(true);
    try {
      const res = await adminApi.createBackup();
      alert(`Backup created successfully: ${res.filename}`);
      fetchBackups();
    } catch (err) {
      alert(err.message || 'Failed to generate backup file');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreSelected = async (filename) => {
    if (!window.confirm(`RESTORE WARNING: This will overwrite your current database tables with the data from "${filename}". All changes made after the backup date will be lost. Proceed?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('filename', filename);
      const res = await adminApi.restoreBackup(formData);
      alert(res.message || 'Database restored successfully!');
      // Force page reload to clear cache
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Restoration failed');
      setActionLoading(false);
    }
  };

  const handleManualUploadRestore = async (e) => {
    e.preventDefault();
    if (!restoreFile) return;

    if (!window.confirm('RESTORE WARNING: You are uploading an external SQL file to overwrite your database tables. All current data will be replaced. Proceed?')) {
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('sql_file', restoreFile);
      const res = await adminApi.restoreBackup(formData);
      alert(res.message || 'Database restored successfully from uploaded file!');
      setRestoreFile(null);
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Restoration failed');
      setActionLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete the backup file "${filename}" from server storage?`)) {
      return;
    }

    try {
      await adminApi.deleteBackup(filename);
      fetchBackups();
    } catch (err) {
      alert(err.message || 'Failed to delete backup file');
    }
  };

  return (
    <div className="space-y-8 select-none relative">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Database Backup & Restore</h1>
          <p className="text-sm text-gray-500 mt-1">
            Maintain database snapshots, download SQL structures, or upload backups to restore settings.
          </p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={actionLoading}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 cursor-pointer disabled:opacity-50"
        >
          <FiPlus className="w-4 h-4" />
          <span>Generate Backup</span>
        </button>
      </div>

      {actionLoading && (
        <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl flex items-center gap-3 text-amber-800 text-sm">
          <FiRefreshCw className="w-5 h-5 animate-spin shrink-0" />
          <span className="font-semibold">Processing database maintenance action... Please do not close this tab.</span>
        </div>
      )}

      {/* Main split dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
        
        {/* BACKUP FILES LIST */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif text-lg font-bold text-gray-800 border-b pb-2 border-gray-100 flex items-center gap-1.5">
            <FiDatabase />
            <span>Server Backup Files</span>
          </h3>

          {loading ? (
            <div className="w-full h-[30vh] flex flex-col items-center justify-center bg-white border border-gray-200 rounded-3xl">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-400 text-xs font-semibold">Reading backup records...</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-left text-sm text-gray-700">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-gray-400 font-bold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Filename</th>
                      <th className="px-6 py-4">Size</th>
                      <th className="px-6 py-4">Generated Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {backups.map((b) => (
                      <tr key={b.filename} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-800">{b.filename}</td>
                        <td className="px-6 py-4 font-semibold text-gray-500">{(b.size / 1024).toFixed(0)} KB</td>
                        <td className="px-6 py-4 text-gray-450">{new Date(b.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right space-x-1.5">
                          <a
                            href={adminApi.downloadBackupUrl(b.filename)}
                            className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-slate-100 text-gray-650 border border-gray-150 rounded-lg transition-colors cursor-pointer"
                            title="Download SQL File"
                          >
                            <FiDownload className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleRestoreSelected(b.filename)}
                            disabled={actionLoading}
                            className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-amber-50 text-amber-600 hover:text-amber-700 border border-gray-150 hover:border-amber-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                            title="Restore Database to this version"
                          >
                            <FiRefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.filename)}
                            className="inline-flex items-center justify-center p-2 bg-gray-50 hover:bg-red-50 text-red-650 border border-gray-150 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
                            title="Delete file"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {backups.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm">
                          No backup files found on the server.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* EXTERNAL RESTORE PANEL */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-800 border-b pb-2 border-gray-50 flex items-center gap-1.5">
              <FiUpload />
              <span>Restore from SQL Upload</span>
            </h3>

            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-2.5 text-red-800 text-xs leading-normal">
              <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>
                <strong>CAUTION:</strong> Restoring database will permanently drop and rebuild all tables. Ensure you have backed up the current database before uploading an external file.
              </span>
            </div>

            <form onSubmit={handleManualUploadRestore} className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50 hover:bg-gray-100/50 transition-colors relative cursor-pointer flex flex-col items-center justify-center">
                <FiDatabase className="w-8 h-8 text-gray-450 mb-2" />
                <span className="text-xs font-semibold text-gray-600">
                  {restoreFile ? restoreFile.name : 'Choose SQL Backup File'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">Only .sql file extensions</span>
                <input
                  type="file"
                  accept=".sql"
                  onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!restoreFile || actionLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all text-xs tracking-wider uppercase cursor-pointer"
              >
                Upload and Restore Now
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BackupRestore;
