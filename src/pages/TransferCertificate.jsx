import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiDownload, FiFileText, FiUser, FiCalendar, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import { cmsApi } from '../cms/api.js';

const TransferCertificate = () => {
  const [studentName, setStudentName] = useState('');
  const [dob, setDob] = useState('');
  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null); // null = no search, 'not_found' | object
  const [hasSearched, setHasSearched] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!dob) newErrors.dob = 'Date of birth is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSearching(true);
    setSearchResult(null);
    setHasSearched(false);

    try {
      const res = await cmsApi.searchCertificate(studentName, dob);
      setIsSearching(false);
      setHasSearched(true);
      setSearchResult({
        name: res.certificate.student_name,
        dob: res.certificate.dob,
        pdfUrl: res.certificate.pdf_path
      });
    } catch (err) {
      setIsSearching(false);
      setHasSearched(true);
      setSearchResult('not_found');
    }
  };

  const handleReset = () => {
    setStudentName('');
    setDob('');
    setErrors({});
    setSearchResult(null);
    setHasSearched(false);
  };

  return (
    <div className="w-full flex-1">
      {/* HERO SECTION */}
      <section className="relative w-full h-[35vh] min-h-[280px] overflow-hidden bg-school-deepRed flex items-center justify-center border-b-4 border-school-gold">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(223,37,49,0.2),transparent_50%)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white px-4 md:px-8 select-none">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3 drop-shadow-md"
          >
            Transfer <span className="text-school-gold">Certificate</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-16 h-1 bg-school-gold rounded-full mx-auto mb-5"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="text-white/80 text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed drop-shadow-sm"
          >
            Search and download your Transfer Certificate by entering the student's name and date of birth.
          </motion.p>
        </div>
      </section>

      {/* SEARCH FORM SECTION */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white border border-school-light/90 rounded-3xl p-6 md:p-10 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-school-red/10 flex items-center justify-center text-school-red mx-auto mb-4">
                <FiFileText className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-school-dark mb-2">Search Certificate</h2>
              <p className="text-school-gray text-xs font-light leading-relaxed max-w-md mx-auto">
                Enter the student's full name and date of birth as registered in school records to locate the Transfer Certificate.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-5">
              {/* Student Name Field */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="studentName" className="text-xs font-semibold text-school-dark flex items-center gap-1.5">
                  <FiUser className="w-3.5 h-3.5 text-school-red" />
                  Student Name *
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  placeholder="Enter student's full name"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (errors.studentName) setErrors((prev) => ({ ...prev, studentName: '' }));
                  }}
                  disabled={isSearching}
                  className={`w-full px-4 py-3.5 bg-school-light/50 border rounded-2xl text-school-dark placeholder-school-gray/50 focus:bg-white focus:border-school-gold focus:ring-1 focus:ring-school-gold transition-all duration-300 outline-none text-sm ${
                    errors.studentName ? 'border-school-red' : 'border-school-light/80'
                  }`}
                />
                {errors.studentName && (
                  <span className="text-[10px] text-school-red font-medium flex items-center gap-1 mt-0.5">
                    <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.studentName}
                  </span>
                )}
              </div>

              {/* Date of Birth Field */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dob" className="text-xs font-semibold text-school-dark flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-school-red" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    if (errors.dob) setErrors((prev) => ({ ...prev, dob: '' }));
                  }}
                  disabled={isSearching}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3.5 bg-school-light/50 border rounded-2xl text-school-dark placeholder-school-gray/50 focus:bg-white focus:border-school-gold focus:ring-1 focus:ring-school-gold transition-all duration-300 outline-none text-sm ${
                    errors.dob ? 'border-school-red' : 'border-school-light/80'
                  }`}
                />
                {errors.dob && (
                  <span className="text-[10px] text-school-red font-medium flex items-center gap-1 mt-0.5">
                    <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.dob}
                  </span>
                )}
              </div>

              {/* Search Button */}
              <motion.button
                type="submit"
                disabled={isSearching}
                whileHover={{ scale: isSearching ? 1 : 1.02 }}
                whileTap={{ scale: isSearching ? 1 : 0.98 }}
                className="w-full mt-2 bg-school-deepRed text-white font-semibold py-3.5 px-6 rounded-2xl hover:bg-school-red transition-all duration-300 shadow-md shadow-school-red/10 flex items-center justify-center gap-2 text-sm"
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Searching Records...</span>
                  </>
                ) : (
                  <>
                    <FiSearch className="w-4 h-4" />
                    <span>Search Certificate</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* SEARCH RESULTS AREA */}
            <AnimatePresence mode="wait">
              {hasSearched && searchResult === 'not_found' && (
                <motion.div
                  key="not-found"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-3">
                    <FiXCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-school-dark mb-1">No Record Found</h4>
                  <p className="text-school-gray text-xs font-light leading-relaxed max-w-sm mx-auto mb-4">
                    No transfer certificate was found for <strong>{studentName}</strong> with the given date of birth. Please verify the details and try again, or contact the school office for assistance.
                  </p>
                  <button
                    onClick={handleReset}
                    className="text-xs font-semibold text-school-red hover:text-school-deepRed transition-colors"
                  >
                    ← Try Again
                  </button>
                </motion.div>
              )}

              {hasSearched && searchResult && searchResult !== 'not_found' && (
                <motion.div
                  key="found"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-school-red/10 flex items-center justify-center text-school-red shrink-0">
                      <FiFileText className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-lg font-bold text-school-dark mb-1">Certificate Found</h4>
                      <p className="text-school-gray text-xs font-light leading-relaxed mb-1">
                        <strong>Student:</strong> {searchResult.name}
                      </p>
                      <p className="text-school-gray text-xs font-light leading-relaxed mb-3">
                        <strong>Date of Birth:</strong> {searchResult.dob}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={searchResult.pdfUrl}
                          download
                          className="inline-flex items-center gap-2 bg-school-gold text-school-dark text-xs font-semibold py-2.5 px-5 rounded-full hover:bg-yellow-500 transition-all duration-300"
                        >
                          <FiDownload className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Inline PDF Preview */}
                  {searchResult.pdfUrl && (
                    <div className="mt-8 w-full h-[500px] md:h-[600px] border border-emerald-100 rounded-2xl overflow-hidden shadow-inner bg-white">
                      <iframe
                        src={`${searchResult.pdfUrl}#toolbar=0`}
                        title={`Transfer Certificate - ${searchResult.name}`}
                        className="w-full h-full border-none"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Info Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center text-xxs text-school-gray/60 font-light mt-6 leading-relaxed max-w-lg mx-auto"
          >
            Transfer Certificates are uploaded by the school administration. If your certificate is not available online, please visit the administrative office or call <strong>+91-8755195353</strong> for assistance.
          </motion.p>
        </div>
      </section>
    </div>
  );
};

export default TransferCertificate;
