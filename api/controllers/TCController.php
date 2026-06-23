<?php
// api/controllers/TCController.php
require_once __DIR__ . '/../helpers/Response.php';

class TCController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Public: Search by name and DOB
    public function search() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Handle both GET/POST query formats
        $student_name = isset($data['student_name']) ? trim($data['student_name']) : (isset($_GET['student_name']) ? trim($_GET['student_name']) : '');
        $dob = isset($data['dob']) ? trim($data['dob']) : (isset($_GET['dob']) ? trim($_GET['dob']) : '');

        if (empty($student_name) || empty($dob)) {
            Response::json(['error' => 'Both Student Name and Date of Birth are required'], 400);
        }

        // Search with exact DOB and matching name (case-insensitive)
        $stmt = $this->db->prepare(
            "SELECT student_name, dob, admission_number, tc_number, issue_date, pdf_path 
             FROM transfer_certificates 
             WHERE LOWER(student_name) = LOWER(?) AND dob = ? AND is_active = 1"
        );
        $stmt->execute([$student_name, $dob]);
        $certificate = $stmt->fetch();

        if ($certificate) {
            Response::json([
                'success' => true,
                'certificate' => $certificate
            ]);
        } else {
            Response::json(['error' => 'No Transfer Certificate Found'], 404);
        }
    }

    // Admin: List all certificates
    public function list() {
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = 20;
        $offset = ($page - 1) * $perPage;

        $where = [];
        $params = [];

        if (!empty($search)) {
            $where[] = "(student_name LIKE ? OR tc_number LIKE ? OR admission_number LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

        // Get total count
        $countStmt = $this->db->prepare("SELECT COUNT(*) as count FROM transfer_certificates $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['count'];

        // Get items
        $stmt = $this->db->prepare(
            "SELECT tc.*, u.name as uploaded_by_name FROM transfer_certificates tc
             LEFT JOIN users u ON tc.uploaded_by = u.id
             $whereClause ORDER BY tc.uploaded_at DESC LIMIT $perPage OFFSET $offset"
        );
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        Response::json([
            'certificates' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage)
        ]);
    }

    // Admin: Upload & Add new Transfer Certificate
    public function create($currentUser) {
        $student_name = isset($_POST['student_name']) ? trim($_POST['student_name']) : '';
        $dob = isset($_POST['dob']) ? trim($_POST['dob']) : '';
        $admission_number = isset($_POST['admission_number']) ? trim($_POST['admission_number']) : '';
        $tc_number = isset($_POST['tc_number']) ? trim($_POST['tc_number']) : '';
        $issue_date = isset($_POST['issue_date']) ? trim($_POST['issue_date']) : '';
        $userId = $currentUser['userId'];
        $pdf_path = '';

        if (empty($student_name) || empty($dob) || empty($admission_number) || empty($tc_number) || empty($issue_date)) {
            Response::json(['error' => 'All certificate fields are required'], 400);
        }

        // Verify unique tc_number
        $chk = $this->db->prepare("SELECT COUNT(*) as count FROM transfer_certificates WHERE tc_number = ?");
        $chk->execute([$tc_number]);
        if ($chk->fetch()['count'] > 0) {
            Response::json(['error' => 'Certificate Number already exists in the system'], 400);
        }

        // Process PDF upload
        if (isset($_FILES['pdf']) && $_FILES['pdf']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['pdf'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

            if ($ext !== 'pdf' || $file['type'] !== 'application/pdf') {
                Response::json(['error' => 'Only PDF files are allowed'], 400);
            }

            // Create directories
            $uploadDir = __DIR__ . '/../../uploads/certificates/';
            $relativeDir = 'uploads/certificates/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $filename = 'TC_' . time() . '_' . preg_replace('/[^a-zA-Z0-9]/', '_', $student_name) . '.pdf';
            $destPath = $uploadDir . $filename;
            $pdf_path = '/' . $relativeDir . $filename;

            if (!move_uploaded_file($file['tmp_name'], $destPath)) {
                Response::json(['error' => 'Failed to save certificate PDF to server'], 500);
            }
        } else if (isset($_POST['pdf_url'])) {
            // Re-use existing pdf url
            $pdf_path = trim($_POST['pdf_url']);
        }

        if (empty($pdf_path)) {
            Response::json(['error' => 'Certificate PDF file is required'], 400);
        }

        // Insert certificate
        $stmt = $this->db->prepare(
            "INSERT INTO transfer_certificates (student_name, dob, admission_number, tc_number, issue_date, pdf_path, uploaded_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $student_name,
            $dob,
            $admission_number,
            $tc_number,
            $issue_date,
            $pdf_path,
            $userId
        ]);

        Response::json([
            'message' => 'Transfer Certificate added successfully',
            'id' => $this->db->lastInsertId()
        ]);
    }

    // Admin: Edit certificate details
    public function update($id, $currentUser) {
        $student_name = isset($_POST['student_name']) ? trim($_POST['student_name']) : '';
        $dob = isset($_POST['dob']) ? trim($_POST['dob']) : '';
        $admission_number = isset($_POST['admission_number']) ? trim($_POST['admission_number']) : '';
        $tc_number = isset($_POST['tc_number']) ? trim($_POST['tc_number']) : '';
        $issue_date = isset($_POST['issue_date']) ? trim($_POST['issue_date']) : '';
        $is_active = isset($_POST['is_active']) ? (int)$_POST['is_active'] : 1;
        $userId = $currentUser['userId'];

        if (empty($student_name) || empty($dob) || empty($admission_number) || empty($tc_number) || empty($issue_date)) {
            Response::json(['error' => 'All certificate fields are required'], 400);
        }

        // Get existing details
        $stmt = $this->db->prepare("SELECT * FROM transfer_certificates WHERE id = ?");
        $stmt->execute([$id]);
        $cert = $stmt->fetch();

        if (!$cert) {
            Response::json(['error' => 'Certificate not found'], 404);
        }

        // Verify uniqueness of tc_number (excluding self)
        $chk = $this->db->prepare("SELECT COUNT(*) as count FROM transfer_certificates WHERE tc_number = ? AND id != ?");
        $chk->execute([$tc_number, $id]);
        if ($chk->fetch()['count'] > 0) {
            Response::json(['error' => 'Certificate Number already exists in the system'], 400);
        }

        $pdf_path = $cert['pdf_path'];

        // If new PDF file is uploaded
        if (isset($_FILES['pdf']) && $_FILES['pdf']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['pdf'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

            if ($ext !== 'pdf' || $file['type'] !== 'application/pdf') {
                Response::json(['error' => 'Only PDF files are allowed'], 400);
            }

            $uploadDir = __DIR__ . '/../../uploads/certificates/';
            $relativeDir = 'uploads/certificates/';
            $filename = 'TC_' . time() . '_' . preg_replace('/[^a-zA-Z0-9]/', '_', $student_name) . '.pdf';
            $destPath = $uploadDir . $filename;

            // Delete old physical file if exists
            $oldPath = __DIR__ . '/../../' . ltrim($cert['pdf_path'], '/');
            if (file_exists($oldPath) && is_file($oldPath)) {
                unlink($oldPath);
            }

            if (move_uploaded_file($file['tmp_name'], $destPath)) {
                $pdf_path = '/' . $relativeDir . $filename;
            } else {
                Response::json(['error' => 'Failed to upload new PDF file'], 500);
            }
        }

        // Update fields
        $stmt = $this->db->prepare(
            "UPDATE transfer_certificates 
             SET student_name = ?, dob = ?, admission_number = ?, tc_number = ?, issue_date = ?, pdf_path = ?, is_active = ?
             WHERE id = ?"
        );
        $stmt->execute([
            $student_name,
            $dob,
            $admission_number,
            $tc_number,
            $issue_date,
            $pdf_path,
            $is_active,
            $id
        ]);

        Response::json(['message' => 'Transfer Certificate updated successfully']);
    }

    // Admin: Delete certificate
    public function delete($id) {
        $stmt = $this->db->prepare("SELECT * FROM transfer_certificates WHERE id = ?");
        $stmt->execute([$id]);
        $cert = $stmt->fetch();

        if (!$cert) {
            Response::json(['error' => 'Certificate not found'], 404);
        }

        // Delete associated PDF file
        $pdfFile = __DIR__ . '/../../' . ltrim($cert['pdf_path'], '/');
        if (file_exists($pdfFile) && is_file($pdfFile)) {
            unlink($pdfFile);
        }

        $stmt = $this->db->prepare("DELETE FROM transfer_certificates WHERE id = ?");
        $stmt->execute([$id]);

        Response::json(['message' => 'Transfer Certificate deleted successfully']);
    }
}
?>
