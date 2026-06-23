<?php
// api/controllers/BlockController.php
require_once __DIR__ . '/../helpers/Response.php';

class BlockController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Admin: Add a new block to page
    public function create($currentUser) {
        $data = json_decode(file_get_contents("php://input"), true);
        $page_id = isset($data['page_id']) ? (int)$data['page_id'] : 0;
        $block_type = isset($data['block_type']) ? trim($data['block_type']) : '';
        $block_data = isset($data['data']) ? $data['data'] : [];
        $userId = $currentUser['userId'];

        if ($page_id <= 0 || empty($block_type)) {
            Response::json(['error' => 'Page ID and Block Type are required'], 400);
        }

        // Get current max sort order for page
        $stmt = $this->db->prepare("SELECT COALESCE(MAX(sort_order), -1) as max_order FROM blocks WHERE page_id = ?");
        $stmt->execute([$page_id]);
        $res = $stmt->fetch();
        $nextOrder = $res['max_order'] + 1;

        $stmt = $this->db->prepare(
            "INSERT INTO blocks (page_id, block_type, sort_order, data, status, created_by, updated_by) VALUES (?, ?, ?, ?, 'draft', ?, ?)"
        );
        $stmt->execute([
            $page_id,
            $block_type,
            $nextOrder,
            json_encode($block_data),
            $userId,
            $userId
        ]);

        // Automatically set page status to draft when a block is added
        $updatePage = $this->db->prepare("UPDATE pages SET status = 'draft', updated_by = ? WHERE id = ?");
        $updatePage->execute([$userId, $page_id]);

        Response::json(['message' => 'Block added successfully', 'block_id' => $this->db->lastInsertId()]);
    }

    // Admin: Update block content
    public function update($id, $currentUser) {
        $data = json_decode(file_get_contents("php://input"), true);
        $block_data = isset($data['data']) ? $data['data'] : null;
        $userId = $currentUser['userId'];

        if ($block_data === null) {
            Response::json(['error' => 'Block data payload is required'], 400);
        }

        // Fetch block to check page_id
        $stmt = $this->db->prepare("SELECT page_id FROM blocks WHERE id = ?");
        $stmt->execute([$id]);
        $block = $stmt->fetch();

        if (!$block) {
            Response::json(['error' => 'Block not found'], 404);
        }

        $stmt = $this->db->prepare(
            "UPDATE blocks SET data = ?, status = 'draft', updated_by = ? WHERE id = ?"
        );
        $stmt->execute([json_encode($block_data), $userId, $id]);

        // Mark page as draft
        $updatePage = $this->db->prepare("UPDATE pages SET status = 'draft', updated_by = ? WHERE id = ?");
        $updatePage->execute([$userId, $block['page_id']]);

        Response::json(['message' => 'Block updated successfully']);
    }

    // Admin: Delete block
    public function delete($id, $currentUser) {
        $userId = $currentUser['userId'];

        // Get block info
        $stmt = $this->db->prepare("SELECT page_id, sort_order FROM blocks WHERE id = ?");
        $stmt->execute([$id]);
        $block = $stmt->fetch();

        if (!$block) {
            Response::json(['error' => 'Block not found'], 404);
        }

        $page_id = $block['page_id'];
        $sort_order = $block['sort_order'];

        $this->db->beginTransaction();

        try {
            // Delete block
            $stmt = $this->db->prepare("DELETE FROM blocks WHERE id = ?");
            $stmt->execute([$id]);

            // Shift subsequent blocks down
            $stmt = $this->db->prepare("UPDATE blocks SET sort_order = sort_order - 1 WHERE page_id = ? AND sort_order > ?");
            $stmt->execute([$page_id, $sort_order]);

            // Mark page as draft
            $updatePage = $this->db->prepare("UPDATE pages SET status = 'draft', updated_by = ? WHERE id = ?");
            $updatePage->execute([$userId, $page_id]);

            $this->db->commit();
            Response::json(['message' => 'Block deleted successfully']);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Failed to delete block: ' . $e->getMessage()], 500);
        }
    }

    // Admin: Reorder blocks
    public function reorder($pageId, $currentUser) {
        $data = json_decode(file_get_contents("php://input"), true);
        $orders = isset($data['orders']) ? $data['orders'] : []; // Array of ids in new order
        $userId = $currentUser['userId'];

        if (empty($orders)) {
            Response::json(['error' => 'New orders list is required'], 400);
        }

        $this->db->beginTransaction();

        try {
            foreach ($orders as $index => $id) {
                $stmt = $this->db->prepare("UPDATE blocks SET sort_order = ?, status = 'draft', updated_by = ? WHERE id = ? AND page_id = ?");
                $stmt->execute([$index, $userId, $id, $pageId]);
            }

            // Mark page as draft
            $updatePage = $this->db->prepare("UPDATE pages SET status = 'draft', updated_by = ? WHERE id = ?");
            $updatePage->execute([$userId, $pageId]);

            $this->db->commit();
            Response::json(['message' => 'Blocks reordered successfully']);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Failed to reorder blocks: ' . $e->getMessage()], 500);
        }
    }

    // Admin: Toggle visibility
    public function toggleVisibility($id, $currentUser) {
        $userId = $currentUser['userId'];

        $stmt = $this->db->prepare("SELECT is_visible, page_id FROM blocks WHERE id = ?");
        $stmt->execute([$id]);
        $block = $stmt->fetch();

        if (!$block) {
            Response::json(['error' => 'Block not found'], 404);
        }

        $newVal = $block['is_visible'] ? 0 : 1;

        $stmt = $this->db->prepare("UPDATE blocks SET is_visible = ?, status = 'draft', updated_by = ? WHERE id = ?");
        $stmt->execute([$newVal, $userId, $id]);

        // Mark page as draft
        $updatePage = $this->db->prepare("UPDATE pages SET status = 'draft', updated_by = ? WHERE id = ?");
        $updatePage->execute([$userId, $block['page_id']]);

        Response::json(['message' => 'Block visibility updated', 'is_visible' => $newVal]);
    }
}
?>
