<?php
// api/controllers/HomepageController.php
require_once __DIR__ . '/../helpers/Response.php';

class HomepageController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Public: Get only enabled homepage sections in sort order
    public function getPublic() {
        $stmt = $this->db->query("SELECT * FROM homepage_sections WHERE is_enabled = 1 ORDER BY sort_order ASC");
        $sections = $stmt->fetchAll();

        foreach ($sections as &$section) {
            $section['content'] = json_decode($section['content'], true);
        }

        Response::json($sections);
    }

    // Admin: Get all homepage sections
    public function adminList() {
        $stmt = $this->db->query("SELECT * FROM homepage_sections ORDER BY sort_order ASC");
        $sections = $stmt->fetchAll();

        foreach ($sections as &$section) {
            $section['content'] = json_decode($section['content'], true);
        }

        Response::json($sections);
    }

    // Admin: Save homepage sections order
    public function updateOrder($currentUser) {
        $data = json_decode(file_get_contents("php://input"), true);
        $orders = isset($data['orders']) ? $data['orders'] : []; // Array of keys in order
        $userId = $currentUser['userId'];

        if (empty($orders)) {
            Response::json(['error' => 'Orders payload is required'], 400);
        }

        $this->db->beginTransaction();

        try {
            foreach ($orders as $index => $key) {
                $stmt = $this->db->prepare(
                    "UPDATE homepage_sections SET sort_order = ?, updated_by = ? WHERE section_key = ?"
                );
                $stmt->execute([$index, $userId, $key]);
            }

            $this->db->commit();
            Response::json(['message' => 'Homepage sections order updated']);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Failed to save sections order: ' . $e->getMessage()], 500);
        }
    }

    // Admin: Update/Toggle section details
    public function updateSection($key, $currentUser) {
        $data = json_decode(file_get_contents("php://input"), true);
        $is_enabled = isset($data['is_enabled']) ? (int)$data['is_enabled'] : 1;
        $content = isset($data['content']) ? $data['content'] : null;
        $userId = $currentUser['userId'];

        // Get existing section
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM homepage_sections WHERE section_key = ?");
        $stmt->execute([$key]);
        $exists = $stmt->fetch()['count'] > 0;

        if (!$exists) {
            // Seed section dynamic metadata if not exists
            $stmt = $this->db->prepare(
                "INSERT INTO homepage_sections (section_key, section_name, is_enabled, content, updated_by) VALUES (?, ?, ?, ?, ?)"
            );
            $name = ucwords(str_replace('_', ' ', $key));
            $stmt->execute([$key, $name, $is_enabled, json_encode($content), $userId]);
        } else {
            $stmt = $this->db->prepare(
                "UPDATE homepage_sections SET is_enabled = ?, content = ?, updated_by = ? WHERE section_key = ?"
            );
            $stmt->execute([$is_enabled, json_encode($content), $userId, $key]);
        }

        Response::json(['message' => 'Homepage section updated successfully']);
    }
}
?>
