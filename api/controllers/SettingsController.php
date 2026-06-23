<?php
// api/controllers/SettingsController.php
require_once __DIR__ . '/../helpers/Response.php';

class SettingsController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Public: Get all settings as key-value pairs
    public function getPublic() {
        $stmt = $this->db->query("SELECT setting_key, setting_value FROM site_settings");
        $settings = $stmt->fetchAll();
        
        $output = [];
        foreach ($settings as $setting) {
            $output[$setting['setting_key']] = $setting['setting_value'];
        }

        Response::json($output);
    }

    // Admin: Get all settings (with group categorization)
    public function adminGet() {
        $stmt = $this->db->query("SELECT * FROM site_settings");
        Response::json($stmt->fetchAll());
    }

    // Admin: Save/Update site settings (bulk key-value inputs)
    public function adminSave($currentUser) {
        $data = json_decode(file_get_contents("php://input"), true);
        $userId = $currentUser['userId'];

        if (!is_array($data)) {
            Response::json(['error' => 'Invalid settings payload'], 400);
        }

        $this->db->beginTransaction();

        try {
            foreach ($data as $key => $value) {
                // Determine group based on key prefix
                $group = 'general';
                if (strpos($key, 'social_') === 0) {
                    $group = 'social';
                } elseif (strpos($key, 'principal_') === 0) {
                    $group = 'principal';
                } elseif (strpos($key, 'trustee_') === 0) {
                    $group = 'trustee';
                }

                // Check if setting key exists
                $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM site_settings WHERE setting_key = ?");
                $stmt->execute([$key]);
                $exists = $stmt->fetch()['count'] > 0;

                if ($exists) {
                    $stmt = $this->db->prepare(
                        "UPDATE site_settings SET setting_value = ?, setting_group = ?, updated_by = ? WHERE setting_key = ?"
                    );
                    $stmt->execute([$value, $group, $userId, $key]);
                } else {
                    $stmt = $this->db->prepare(
                        "INSERT INTO site_settings (setting_key, setting_value, setting_group, updated_by) VALUES (?, ?, ?, ?)"
                    );
                    $stmt->execute([$key, $value, $group, $userId]);
                }
            }

            $this->db->commit();
            Response::json(['message' => 'Settings saved successfully']);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Failed to save settings: ' . $e->getMessage()], 500);
        }
    }
}
?>
