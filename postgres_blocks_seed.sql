-- Insert content blocks for the Mandatory Disclosures page (page_id = 6)
-- We insert text headers and tables, setting placeholders for files where appropriate
INSERT INTO blocks (page_id, block_type, sort_order, data, status, version, is_visible, created_at, updated_at) 
VALUES
  (
    6, 
    'text', 
    0, 
    '{"heading": "A : GENERAL INFORMATION", "alignment": "left", "body": ""}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'table', 
    1, 
    '{"headers": ["SL NO.", "INFORMATION", "DETAILS"], "rows": [["1", "NAME OF THE SCHOOL", "THE GREENWOOD PUB SCH CHUDIYALA HARIDWAR UK"], ["2", "AFFILIATION NO.(IF APPLICABLE)", "3530551"], ["3", "SCHOOL CODE (IF APPLICABLE)", "81971"], ["4", "COMPLETE ADDRESS WITH PIN CODE", "THE GREENWOOD PUBLIC SCHOOL, RAILWAY STATION CHUDIYALA, VILLAGE-TEJJUPUR, HARIDWAR, - 247661"], ["5", "PRINCIPAL NAME", "MR AMIT SINGHAL"], ["6", "PRINCIPAL QUALIFICATION", "M.Sc. BEd"], ["7", "SCHOOL EMAIL ID", "greenwoodroorkee@gmail.com"], ["8", "CONTACT DETAILS (LANDLINE/MOBILE)", "8755205353"]]}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'text', 
    2, 
    '{"heading": "B : DOCUMENTS AND INFORMATION:", "alignment": "left", "body": ""}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'table', 
    3, 
    '{"headers": ["SL NO.", "DOCUMENTS/INFORMATION", "LINKS OF UPLOADED DOCUMENTS"], "rows": [["1", "COPIES OF AFFILIATION/UPGRADATION LETTER AND RECENT EXTENSION OF AFFILIATION, IF ANY", "#"], ["2", "COPIES OF SOCIETIES/TRUST/COMPANY REGISTRATION/RENEWAL CERTIFICATE, AS APPLICABLE", "#"], ["3", "COPY OF NO OBJECTION CERTIFICATE (NOC) ISSUED, IF APPLICABLE, BY THE STATE GOVT./UT", "#"], ["4", "COPIES OF RECOGNITION CERTIFICATE UNDER RTE ACT, 2009, AND IT''S RENEWAL IF APPLICABLE", "#"], ["5", "COPY OF VALID BUILDING SAFETY CERTIFICATE AS PER THE NATIONAL BUILDING CODE", "#"], ["6", "COPY OF VALID FIRE SAFETY CERTIFICATE ISSUED BY THE COMPETENT AUTHORITY", "#"], ["7", "COPY OF THE SELF CERTIFICATION SUBMITTED BY THE SCHOOL FOR AFFILIATION/UPGRADATION/EXTENSION OF AFFILIATION", "#"], ["8", "COPIES OF VALID WATER, HEALTH AND SANITATION CERTIFICATES", "#"]]}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'text', 
    4, 
    '{"heading": "", "alignment": "left", "body": "<p><strong>NOTE:</strong> THE SCHOOLS NEEDS TO UPLOAD THE SELF ATTESTED COPIES OF ABOVE LISTED DOCUMENTS BY CHAIRMAN/MANAGER/SECRETARY AND PRINCIPAL. IN CASE, IT IS NOTICED AT LATER STAGE THAT UPLOADED DOCUMENTS ARE NOT GENUINE THEN SCHOOL SHALL BE LIABLE FOR ACTION AS PER NORMS.</p>"}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'text', 
    5, 
    '{"heading": "C : RESULT AND ACADEMICS :", "alignment": "left", "body": ""}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'table', 
    6, 
    '{"headers": ["SL NO.", "DOCUMENTS/INFORMATION", "LINKS OF UPLOADED DOCUMENTS"], "rows": [["1", "FEE STRUCTURE OF THE SCHOOL", "#"], ["2", "ANNUAL ACADEMIC CALENDER", "#"], ["3", "LIST OF SCHOOL MANAGEMENT COMMITTEE (SMC)", "#"], ["4", "LIST OF PARENTS TEACHERS ASSOCIATION (PTA) MEMBERS", "#"], ["5", "LAST THREE-YEAR RESULT OF THE BOARD EXAMINATION AS PER APPLICABILITY", "#"]]}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'text', 
    7, 
    '{"heading": "D : STAFF (TEACHING) :", "alignment": "left", "body": ""}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'table', 
    8, 
    '{"headers": ["SL NO.", "INFORMATION", "DETAILS"], "rows": [["1", "PRINCIPAL", "AMIT SINGHAL"], ["2", "TOTAL NO. OF TEACHERS", "34"], ["", "PGT", "9"], ["", "TGT", "13"], ["", "PRT", "12"], ["3", "TEACHERS SECTION RATIO", "1:1.5"], ["4", "DETAILS OF SPECIAL EDUCATOR", "PRAVEEN KUMAR"], ["5", "DETAILS OF COUNSELLOR AND WELLNESS TEACHER", "SANGITA TIWARI"]]}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'text', 
    9, 
    '{"heading": "RESULT CLASS: X", "alignment": "left", "body": ""}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'table', 
    10, 
    '{"headers": ["SL NO.", "YEAR", "NO. OF REGISTERED STUDENTS", "NO. OF STUDENTS PASSED", "PASS PERCENTAGE", "REMARKS"], "rows": [["1", "2023", "40", "39", "97.5", ""]]}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'text', 
    11, 
    '{"heading": "RESULT CLASS: XII", "alignment": "left", "body": ""}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'table', 
    12, 
    '{"headers": ["SL NO.", "YEAR", "NO. OF REGISTERED STUDENTS", "NO. OF STUDENTS PASSED", "PASS PERCENTAGE", "REMARKS"], "rows": [["1", "", "", "", "", "Not Applicable"]]}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'text', 
    13, 
    '{"heading": "E : SCHOOL INFRASTRUCTURE:", "alignment": "left", "body": ""}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'table', 
    14, 
    '{"headers": ["SL NO.", "INFORMATION", "DETAILS"], "rows": [["1", "TOTAL CAMPUS AREA OF THE SCHOOL (IN SQ MTR)", "8196"], ["2", "NO. AND SIZE OF THE CLASS ROOMS (IN SQ MTR)", "20 & 50"], ["3", "NO. AND SIZE OF LABORATORIES INCLUDING COMPUTER LABS (IN SQ MTR)", "5 & 54"], ["4", "INTERNET FACILITY", "YES"], ["5", "NO. OF GIRLS TOILETS", "6"], ["6", "NO. OF BOYS TOILETS", "12"], ["7", "LINK OF YOUTUBE VIDEO OF THE INSPECTION OF SCHOOL COVERING THE INFRASTRUCTURE OF THE SCHOOL", "https://www.youtube.com/watch?v=PCfBkuGmFUg"]]}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'text', 
    15, 
    '{"heading": "F : TEACHER DETAILS:", "alignment": "left", "body": ""}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  ),
  (
    6, 
    'table', 
    16, 
    '{"headers": ["SL NO.", "TEACHER NAME", "DESIGNATION", "QUALIFICATION"], "rows": [["1", "ASHUTOSH SINGH", "PGT", "M.Sc."], ["2", "RAVI KAPIL", "PGT", "M.A."], ["3", "Anuradha", "TGT", "MA"], ["4", "Monika Tyagi", "PRT", "MA"], ["5", "Kartik Tyagi", "PGT", "M.Sc."], ["6", "Neeshu", "OTHER", "M.Lib"], ["7", "Praveen Kumar", "SPECIAL EDUCATOR", "Ph.D."], ["8", "Sangeeta Tiwari", "WELLNESS TEACHER", "M.A."], ["9", "Simta Sharma", "PRT", "B.A."], ["10", "Sanjeeta Rawat", "PRT", "M.A."], ["11", "Arun Yadav", "PGT", "M.Sc"], ["12", "AMAN KUMAR", "PGT", "12"], ["13", "DIVYA KAUSHIK", "PGT", "M.COM"], ["14", "SRISTI TYAGI", "PGT", "M.A"], ["15", "ABHINAV SHARMA", "TGT", "M.SC"], ["16", "Vishakha saini", "PRT", "BA NTT"], ["17", "Shalu Tyagi", "PRT", "M.A."], ["18", "Rekha", "PRT", "M.A."], ["19", "Ruby Sharma", "PRT", "BA NTT"], ["20", "SHALU", "PRT", "B.SC"], ["21", "Abhishek kumar", "PET", "M.P.ed"], ["22", "AMIT SINGHAL", "PRINCIPAL", "M.SC"], ["23", "KAJAL BUTOLA", "PGT", "M. COM."], ["24", "RIDDHI SHARMA", "PGT", "M. SC."], ["25", "RENU DEVI", "PRT", "M. SC."], ["26", "SANGEETA SINGH", "PGT", "M.A."], ["27", "SANGEETA CHOUDHARY", "TGT", "M.A."], ["28", "SILKY TYAGI", "OTHER", "B.A."], ["29", "JIVANTI", "PRT", "M. A."], ["30", "ANJALI SAINI", "PRT", "M. SC."], ["31", "PRERNA GUPTA", "TGT", "M. SC."], ["32", "VIDHI SHARMA", "WELLNESS TEACHER", "M. A."]]}', 
    'published', 
    1, 
    true, 
    NOW(), 
    NOW()
  );
