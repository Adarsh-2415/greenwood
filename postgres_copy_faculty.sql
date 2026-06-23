-- 1. Locate the block ID of the F section (teacher details table block) belonging to page_id = 6 (Mandatory Disclosures)
-- 2. Insert it into the blocks table for page_id = 5 (Faculty & Staff page)
-- 3. The sort_order is set to 2 so it sits nicely below the existing faculty introductory text.

INSERT INTO blocks (page_id, block_type, sort_order, data, status, version, is_visible, created_at, updated_at)
SELECT 
  5, -- page_id for Faculty & Staff
  'table', 
  2, -- sort_order to place below intro text
  data, -- copies the exact json table data of teacher qualifications
  'published', 
  1, 
  true, 
  NOW(), 
  NOW()
FROM blocks 
WHERE page_id = 6 
  AND block_type = 'table' 
  AND data->>'headers' LIKE '%TEACHER NAME%' 
LIMIT 1;
