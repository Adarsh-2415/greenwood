// src/admin/BackupRestore.jsx
import React from 'react';
import { FiDatabase, FiLock, FiCloud, FiCheckCircle } from 'react-icons/fi';

export const BackupRestore = () => {
  return (
    <div className="space-y-8 select-none relative">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Database Backups</h1>
          <p className="text-sm text-gray-500 mt-1">
            Learn how automated database snapshots and point-in-time recovery operate inside your Supabase project.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
        
        {/* Supabase Backup Info */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-gray-800 border-b pb-2 border-gray-100 flex items-center gap-1.5">
            <FiDatabase className="text-amber-500" />
            <span>Automated Backups</span>
          </h3>

          <div className="space-y-4 text-gray-650 leading-relaxed">
            <p>
              Your database has been fully migrated to **Supabase (PostgreSQL)**. Backups are now managed automatically by Supabase at the infrastructure level.
            </p>
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-800 text-xs">Daily Snapshots</h4>
                <p className="text-xxs text-gray-500 mt-1">Supabase performs automatic daily backups of your database, settings, and file metadata.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <FiLock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-800 text-xs">Point-in-Time Recovery (PITR)</h4>
                <p className="text-xxs text-gray-500 mt-1">Allows you to restore your database to any specific second in history (available in Pro/Enterprise plans).</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Manual Backup */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-serif text-lg font-bold text-gray-800 border-b pb-2 border-gray-100 flex items-center gap-1.5">
            <FiCloud className="text-amber-500" />
            <span>Manual Export & Restore</span>
          </h3>

          <div className="space-y-4 text-gray-650 leading-relaxed">
            <p>
              If you want to manually back up or migrate your data tables:
            </p>
            <ol className="list-decimal pl-5 space-y-2.5 text-xs text-gray-600">
              <li>Open your **Supabase Dashboard** (`https://supabase.com/dashboard`).</li>
              <li>Navigate to the **Table Editor** or **SQL Editor**.</li>
              <li>Use the database settings or the command line utility `pg_dump` to export tables:
                <pre className="bg-gray-900 text-amber-400 p-3 rounded-xl font-mono text-[10px] mt-2 select-all overflow-x-auto">
                  pg_dump -H db.shsoxgdmatrldwfinlkc.supabase.co -U postgres &gt; backup.sql
                </pre>
              </li>
              <li>Restores can be performed by running SQL scripts inside the **SQL Editor** panel in Supabase.</li>
            </ol>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BackupRestore;

