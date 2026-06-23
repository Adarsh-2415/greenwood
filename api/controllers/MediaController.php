<?php
// api/controllers/MediaController.php
require_once __DIR__ . '/../helpers/Response.php';

class MediaController {
    private $db;
    private $allowedTypes = [
        'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        'document' => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        'video' => ['video/mp4', 'video/mpeg', 'video/webm', 'video/ogg'],
        'gallery' => ['image/jpeg', 'image/png', 'image/webp'],
        'faculty' => ['image/jpeg', 'image/png', 'image/webp'],
        'certificate' => ['application/pdf'],
        'other' => [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'video/mp4', 'video/mpeg', 'video/webm', 'video/ogg'
        ]
    ];

    private $allowedExtensions = [
        'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        'document' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        'video' => ['mp4', 'mpeg', 'webm', 'ogg'],
        'gallery' => ['jpg', 'jpeg', 'png', 'webp'],
        'faculty' => ['jpg', 'jpeg', 'png', 'webp'],
        'certificate' => ['pdf'],
        'other' => [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
            'pdf', 'doc', 'docx', 'xls', 'xlsx',
            'mp4', 'mpeg', 'webm', 'ogg'
        ]
    ];

    public function __construct($db) {
        $this->db = $db;
    }

    // Admin: Upload media files
    public function upload($currentUser) {
        $category = isset($_POST['category']) ? trim($_POST['category']) : 'other';
        $userId = $currentUser['userId'];

        if (!isset($_FILES['files'])) {
            Response::json(['error' => 'No files uploaded'], 400);
        }

        $files = $_FILES['files'];
        $uploaded = [];
        $errors = [];

        // Normalize files array for multiple files
        $fileList = [];
        if (is_array($files['name'])) {
            $count = count($files['name']);
            for ($i = 0; $i < $count; $i++) {
                $fileList[] = [
                    'name' => $files['name'][$i],
                    'type' => $files['type'][$i],
                    'tmp_name' => $files['tmp_name'][$i],
                    'error' => $files['error'][$i],
                    'size' => $files['size'][$i]
                ];
            }
        } else {
            $fileList[] = $files;
        }

        foreach ($fileList as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                $errors[] = $file['name'] . ' failed to upload (code ' . $file['error'] . ')';
                continue;
            }

            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $mime = $file['type'];

            // Fallback mime verification
            if (function_exists('finfo_open')) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime = finfo_file($finfo, $file['tmp_name']);
                finfo_close($finfo);
            }

            // Prevent double-extensions and dangerous files
            $lowerName = strtolower($file['name']);
            $forbiddenPatterns = ['.php', '.phtml', '.php3', '.php4', '.php5', '.phps', '.phar', '.sh', '.exe', '.bat', '.cmd', '.pl', '.py', '.cgi', '.html', '.htm', '.js', '.htaccess', '.htpasswd'];
            $isDangerous = false;
            foreach ($forbiddenPatterns as $pattern) {
                if (strpos($lowerName, $pattern) !== false) {
                    $isDangerous = true;
                    break;
                }
            }

            if ($isDangerous) {
                $errors[] = $file['name'] . ' contains a forbidden file extension or segment.';
                continue;
            }

            // Validate extension
            $validExtensions = isset($this->allowedExtensions[$category]) ? $this->allowedExtensions[$category] : null;
            if ($validExtensions === null || !in_array($ext, $validExtensions)) {
                $errors[] = $file['name'] . ' extension (.' . $ext . ') is not allowed for category ' . $category;
                continue;
            }

            // Validate mime type
            $validTypes = isset($this->allowedTypes[$category]) ? $this->allowedTypes[$category] : null;
            if ($validTypes === null || !in_array($mime, $validTypes)) {
                $errors[] = $file['name'] . ' MIME type (' . $mime . ') is not allowed for category ' . $category;
                continue;
            }

            // Generate unique filename
            $sanitized = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
            $filename = time() . '_' . $sanitized . '.' . $ext;
            
            $subFolder = in_array($category, ['image', 'document', 'video', 'gallery', 'faculty', 'certificate']) ? $category : 'other';
            $uploadDir = __DIR__ . '/../../uploads/' . $subFolder . '/';
            $relativeDir = 'uploads/' . $subFolder . '/';

            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $destPath = $uploadDir . $filename;
            $fileUrl = '/' . $relativeDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $destPath)) {
                $stmt = $this->db->prepare(
                    "INSERT INTO media (filename, original_name, file_path, file_url, file_type, file_extension, file_size, category, title, uploaded_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                );
                $stmt->execute([
                    $filename,
                    $file['name'],
                    $relativeDir . $filename,
                    $fileUrl,
                    $mime,
                    $ext,
                    $file['size'],
                    $category,
                    pathinfo($file['name'], PATHINFO_FILENAME),
                    $userId
                ]);

                $uploaded[] = [
                    'id' => $this->db->lastInsertId(),
                    'filename' => $filename,
                    'original_name' => $file['name'],
                    'file_url' => $fileUrl,
                    'file_size' => $file['size']
                ];
            } else {
                $errors[] = 'Failed to move file ' . $file['name'];
            }
        }

        Response::json([
            'uploaded' => $uploaded,
            'errors' => $errors
        ], empty($uploaded) ? 400 : 200);
    }

    // Admin: List, filter & search media library
    public function list() {
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $category = isset($_GET['category']) ? trim($_GET['category']) : '';
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = 24;
        $offset = ($page - 1) * $perPage;

        $where = [];
        $params = [];

        if (!empty($search)) {
            $where[] = "(original_name LIKE ? OR title LIKE ? OR alt_text LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if (!empty($category)) {
            $where[] = "category = ?";
            $params[] = $category;
        }

        $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

        // Total count
        $countStmt = $this->db->prepare("SELECT COUNT(*) as count FROM media $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetch()['count'];

        // Get items
        $stmt = $this->db->prepare(
            "SELECT m.*, u.name as uploaded_by_name FROM media m 
             LEFT JOIN users u ON m.uploaded_by = u.id 
             $whereClause ORDER BY m.created_at DESC LIMIT $perPage OFFSET $offset"
        );
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        Response::json([
            'media' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage)
        ]);
    }

    // Admin: Update Alt Text & Title
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"), true);
        $title = isset($data['title']) ? trim($data['title']) : '';
        $alt_text = isset($data['alt_text']) ? trim($data['alt_text']) : '';

        $stmt = $this->db->prepare("UPDATE media SET title = ?, alt_text = ? WHERE id = ?");
        $stmt->execute([$title, $alt_text, $id]);

        Response::json(['message' => 'Media metadata updated successfully']);
    }

    // Admin: Delete media file
    public function delete($id) {
        $stmt = $this->db->prepare("SELECT * FROM media WHERE id = ?");
        $stmt->execute([$id]);
        $media = $stmt->fetch();

        if (!$media) {
            Response::json(['error' => 'Media file not found'], 404);
        }

        // Check page block usage or certificates usage before deleting
        // If usage > 0, return warning
        if ($media['usage_count'] > 0) {
            Response::json(['error' => 'This media is currently used in page content blocks and cannot be deleted.'], 400);
        }

        $fullPath = __DIR__ . '/../../' . $media['file_path'];
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }

        $stmt = $this->db->prepare("DELETE FROM media WHERE id = ?");
        $stmt->execute([$id]);

        Response::json(['message' => 'Media deleted successfully']);
    }

    // Admin: Usage verification
    public function getUsage($id) {
        $stmt = $this->db->prepare("SELECT * FROM media WHERE id = ?");
        $stmt->execute([$id]);
        $media = $stmt->fetch();

        if (!$media) {
            Response::json(['error' => 'Media not found'], 404);
        }

        $url = $media['file_url'];
        // Look up in blocks data
        $stmt = $this->db->query("SELECT b.id, b.block_type, p.title as page_title, p.slug FROM blocks b JOIN pages p ON b.page_id = p.id");
        $blocks = $stmt->fetchAll();
        $usedIn = [];

        foreach ($blocks as $block) {
            // Simple check if url exists in blocks data JSON
            if (strpos($block['data'], $url) !== false) {
                $usedIn[] = [
                    'block_id' => $block['id'],
                    'block_type' => $block['block_type'],
                    'page_title' => $block['page_title'],
                    'slug' => $block['slug']
                ];
            }
        }

        Response::json([
            'media_id' => $id,
            'used_count' => count($usedIn),
            'used_in' => $usedIn
        ]);
    }
}
?>
