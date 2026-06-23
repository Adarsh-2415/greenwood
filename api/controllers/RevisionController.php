<?php
// api/controllers/RevisionController.php
require_once __DIR__ . '/../helpers/Response.php';

class RevisionController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Admin: List page revisions
    public function getPageRevisions($pageId) {
        $stmt = $this->db->prepare(
            "SELECT r.*, u.name as revised_by_name FROM page_revisions r 
             LEFT JOIN users u ON r.revised_by = u.id 
             WHERE r.page_id = ? ORDER BY r.created_at DESC"
        );
        $stmt->execute([$pageId]);
        Response::json($stmt->fetchAll());
    }

    // Admin: Rollback page to a specific version
    public function rollbackPage($pageId, $version, $currentUser) {
        $userId = $currentUser['userId'];
        $this->db->beginTransaction();

        try {
            // Get current page state
            $stmt = $this->db->prepare("SELECT * FROM pages WHERE id = ?");
            $stmt->execute([$pageId]);
            $currentPage = $stmt->fetch();

            if (!$currentPage) {
                throw new Exception('Page not found');
            }

            // Save snapshot of current state as a revision
            $revStmt = $this->db->prepare(
                "INSERT INTO page_revisions (page_id, version, title, hero_title, hero_subtitle, hero_image, meta_title, meta_description, meta_keywords, og_image, canonical_url, status, change_summary, revised_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $revStmt->execute([
                $pageId, $currentPage['version'], $currentPage['title'], $currentPage['hero_title'],
                $currentPage['hero_subtitle'], $currentPage['hero_image'], $currentPage['meta_title'],
                $currentPage['meta_description'], $currentPage['meta_keywords'], $currentPage['og_image'],
                $currentPage['canonical_url'], $currentPage['status'], "Snapshot before rollback to v$version", $userId
            ]);

            // Save block revisions for current state
            $stmt = $this->db->prepare("SELECT * FROM blocks WHERE page_id = ?");
            $stmt->execute([$pageId]);
            $currentBlocks = $stmt->fetchAll();

            foreach ($currentBlocks as $block) {
                $bRevStmt = $this->db->prepare(
                    "INSERT INTO block_revisions (block_id, page_id, version, block_type, sort_order, data, status, revised_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                );
                $bRevStmt->execute([
                    $block['id'], $pageId, $currentPage['version'], $block['block_type'],
                    $block['sort_order'], $block['data'], $block['status'], $userId
                ]);
            }

            // Fetch target page revision
            $stmt = $this->db->prepare("SELECT * FROM page_revisions WHERE page_id = ? AND version = ?");
            $stmt->execute([$pageId, $version]);
            $targetRev = $stmt->fetch();

            if (!$targetRev) {
                throw new Exception('Target page version not found in history');
            }

            // Restore page fields
            $stmt = $this->db->prepare(
                "UPDATE pages SET title = ?, hero_title = ?, hero_subtitle = ?, hero_image = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, og_image = ?, canonical_url = ?, status = 'draft', version = version + 1, updated_by = ? WHERE id = ?"
            );
            $stmt->execute([
                $targetRev['title'], $targetRev['hero_title'], $targetRev['hero_subtitle'],
                $targetRev['hero_image'], $targetRev['meta_title'], $targetRev['meta_description'],
                $targetRev['meta_keywords'], $targetRev['og_image'], $targetRev['canonical_url'],
                $userId, $pageId
            ]);

            // Fetch target block revisions for that version
            $stmt = $this->db->prepare("SELECT * FROM block_revisions WHERE page_id = ? AND version = ?");
            $stmt->execute([$pageId, $version]);
            $targetBlocks = $stmt->fetchAll();

            // Clear current blocks for this page
            $stmt = $this->db->prepare("DELETE FROM blocks WHERE page_id = ?");
            $stmt->execute([$pageId]);

            // Restore blocks
            foreach ($targetBlocks as $b) {
                $stmt = $this->db->prepare(
                    "INSERT INTO blocks (id, page_id, block_type, sort_order, data, status, version, is_visible, created_by, updated_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)"
                );
                // Try to retain the block ID if possible, otherwise DB generates new ones
                $stmt->execute([
                    $b['block_id'], $pageId, $b['block_type'], $b['sort_order'],
                    $b['data'], 'draft', $version, $userId, $userId
                ]);
            }

            $this->db->commit();
            Response::json(['message' => "Successfully rolled back to version $version. Page is now in draft status."]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Rollback failed: ' . $e->getMessage()], 500);
        }
    }
}
?>
