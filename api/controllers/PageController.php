<?php
// api/controllers/PageController.php
require_once __DIR__ . '/../helpers/Response.php';

class PageController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Public: get published page + published blocks
    public function getBySlug($slug) {
        $stmt = $this->db->prepare("SELECT * FROM pages WHERE slug = ? AND status = 'published'");
        $stmt->execute([$slug]);
        $page = $stmt->fetch();

        if (!$page) {
            Response::json(['error' => 'Page not found'], 404);
        }

        // Get blocks
        $stmt = $this->db->prepare(
            "SELECT * FROM blocks WHERE page_id = ? AND status = 'published' AND is_visible = 1 ORDER BY sort_order ASC"
        );
        $stmt->execute([$page['id']]);
        $blocks = $stmt->fetchAll();

        foreach ($blocks as &$block) {
            $block['data'] = json_decode($block['data'], true);
        }

        Response::json([
            'page' => $page,
            'blocks' => $blocks
        ]);
    }

    // Public: List all published pages
    public function listPublished() {
        $stmt = $this->db->query("SELECT id, slug, title, route, template FROM pages WHERE status = 'published' ORDER BY title ASC");
        Response::json($stmt->fetchAll());
    }

    // Admin: List all pages (draft + published)
    public function adminList() {
        $stmt = $this->db->query(
            "SELECT p.*, u.name as updated_by_name FROM pages p LEFT JOIN users u ON p.updated_by = u.id ORDER BY p.updated_at DESC"
        );
        Response::json($stmt->fetchAll());
    }

    // Admin: Get page by id with all blocks (draft + published)
    public function adminGet($id) {
        $stmt = $this->db->prepare("SELECT * FROM pages WHERE id = ?");
        $stmt->execute([$id]);
        $page = $stmt->fetch();

        if (!$page) {
            Response::json(['error' => 'Page not found'], 404);
        }

        $stmt = $this->db->prepare("SELECT * FROM blocks WHERE page_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$id]);
        $blocks = $stmt->fetchAll();

        foreach ($blocks as &$block) {
            $block['data'] = json_decode($block['data'], true);
        }

        Response::json([
            'page' => $page,
            'blocks' => $blocks
        ]);
    }

    // Admin: Create new page (from template)
    public function create($currentUser) {
        $data = json_decode(file_get_contents("php://input"), true);
        $title = isset($data['title']) ? trim($data['title']) : '';
        $slug = isset($data['slug']) ? trim($data['slug']) : '';
        $route = isset($data['route']) ? trim($data['route']) : '';
        $template = isset($data['template']) ? trim($data['template']) : 'basic';
        $userId = $currentUser['userId'];

        if (empty($title) || empty($slug) || empty($route)) {
            Response::json(['error' => 'Title, slug and route are required'], 400);
        }

        // Verify slug uniqueness
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM pages WHERE slug = ?");
        $stmt->execute([$slug]);
        $res = $stmt->fetch();
        if ($res['count'] > 0) {
            Response::json(['error' => 'Slug already in use'], 400);
        }

        $this->db->beginTransaction();

        try {
            // Get default blocks from templates table
            $stmt = $this->db->prepare("SELECT default_blocks FROM page_templates WHERE name = ?");
            $stmt->execute([$template]);
            $tpl = $stmt->fetch();
            $defaultBlocks = $tpl ? json_decode($tpl['default_blocks'], true) : [];

            // Insert page
            $stmt = $this->db->prepare(
                "INSERT INTO pages (slug, title, route, template, status, hero_title, created_by, updated_by) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?)"
            );
            $stmt->execute([$slug, $title, $route, $template, $title, $userId, $userId]);
            $pageId = $this->db->lastInsertId();

            // Insert default blocks
            if ($defaultBlocks) {
                foreach ($defaultBlocks as $index => $blockDef) {
                    $bStmt = $this->db->prepare(
                        "INSERT INTO blocks (page_id, block_type, sort_order, data, status, created_by, updated_by) VALUES (?, ?, ?, ?, 'draft', ?, ?)"
                    );
                    $bStmt->execute([
                        $pageId,
                        $blockDef['block_type'],
                        $index,
                        json_encode($blockDef['data']),
                        $userId,
                        $userId
                    ]);
                }
            }

            $this->db->commit();
            Response::json(['message' => 'Page created successfully', 'page_id' => $pageId]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Failed to create page: ' . $e->getMessage()], 500);
        }
    }

    // Admin: Update page metadata & SEO
    public function update($id, $currentUser) {
        $data = json_decode(file_get_contents("php://input"), true);
        $title = isset($data['title']) ? trim($data['title']) : '';
        $slug = isset($data['slug']) ? trim($data['slug']) : '';
        $route = isset($data['route']) ? trim($data['route']) : '';
        $hero_title = isset($data['hero_title']) ? trim($data['hero_title']) : null;
        $hero_subtitle = isset($data['hero_subtitle']) ? trim($data['hero_subtitle']) : null;
        $hero_image = isset($data['hero_image']) ? trim($data['hero_image']) : null;
        $meta_title = isset($data['meta_title']) ? trim($data['meta_title']) : null;
        $meta_description = isset($data['meta_description']) ? trim($data['meta_description']) : null;
        $meta_keywords = isset($data['meta_keywords']) ? trim($data['meta_keywords']) : null;
        $og_image = isset($data['og_image']) ? trim($data['og_image']) : null;
        $canonical_url = isset($data['canonical_url']) ? trim($data['canonical_url']) : null;
        $userId = $currentUser['userId'];

        if (empty($title) || empty($slug) || empty($route)) {
            Response::json(['error' => 'Title, slug and route are required'], 400);
        }

        // Verify slug uniqueness (excluding current page)
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM pages WHERE slug = ? AND id != ?");
        $stmt->execute([$slug, $id]);
        $res = $stmt->fetch();
        if ($res['count'] > 0) {
            Response::json(['error' => 'Slug already in use'], 400);
        }

        // Update page fields
        $stmt = $this->db->prepare(
            "UPDATE pages SET title = ?, slug = ?, route = ?, hero_title = ?, hero_subtitle = ?, hero_image = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, og_image = ?, canonical_url = ?, updated_by = ? WHERE id = ?"
        );
        $stmt->execute([
            $title, $slug, $route, $hero_title, $hero_subtitle, $hero_image,
            $meta_title, $meta_description, $meta_keywords, $og_image, $canonical_url,
            $userId, $id
        ]);

        Response::json(['message' => 'Page updated successfully']);
    }

    // Admin: Publish Page (copies draft to revisions, promotes status)
    public function publish($id, $currentUser) {
        $userId = $currentUser['userId'];
        $this->db->beginTransaction();

        try {
            // Get current page details
            $stmt = $this->db->prepare("SELECT * FROM pages WHERE id = ?");
            $stmt->execute([$id]);
            $page = $stmt->fetch();

            if (!$page) {
                throw new Exception('Page not found');
            }

            // 1. Save page revision
            $revStmt = $this->db->prepare(
                "INSERT INTO page_revisions (page_id, version, title, hero_title, hero_subtitle, hero_image, meta_title, meta_description, meta_keywords, og_image, canonical_url, status, revised_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $revStmt->execute([
                $page['id'], $page['version'], $page['title'], $page['hero_title'],
                $page['hero_subtitle'], $page['hero_image'], $page['meta_title'],
                $page['meta_description'], $page['meta_keywords'], $page['og_image'],
                $page['canonical_url'], $page['status'], $userId
            ]);

            // 2. Save block revisions for current state
            $stmt = $this->db->prepare("SELECT * FROM blocks WHERE page_id = ?");
            $stmt->execute([$id]);
            $blocks = $stmt->fetchAll();

            foreach ($blocks as $block) {
                $bRevStmt = $this->db->prepare(
                    "INSERT INTO block_revisions (block_id, page_id, version, block_type, sort_order, data, status, revised_by)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                );
                $bRevStmt->execute([
                    $block['id'], $id, $page['version'], $block['block_type'],
                    $block['sort_order'], $block['data'], $block['status'], $userId
                ]);
            }

            // 3. Promote page to published & increment version
            $stmt = $this->db->prepare(
                "UPDATE pages SET status = 'published', published_at = NOW(), version = version + 1, updated_by = ? WHERE id = ?"
            );
            $stmt->execute([$userId, $id]);

            // 4. Promote all page blocks to published
            $stmt = $this->db->prepare(
                "UPDATE blocks SET status = 'published', version = version + 1, updated_by = ? WHERE page_id = ?"
            );
            $stmt->execute([$userId, $id]);

            // 5. Clean up old revisions (retain only last 20)
            $cleanupStmt = $this->db->prepare(
                "DELETE FROM page_revisions WHERE page_id = ? AND id NOT IN (
                    SELECT id FROM (
                        SELECT id FROM page_revisions WHERE page_id = ? ORDER BY created_at DESC LIMIT 20
                    ) AS keep
                )"
            );
            $cleanupStmt->execute([$id, $id]);

            $this->db->commit();
            Response::json(['message' => 'Page published successfully']);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Failed to publish page: ' . $e->getMessage()], 500);
        }
    }

    // Admin: Unpublish Page
    public function unpublish($id, $currentUser) {
        $userId = $currentUser['userId'];
        $stmt = $this->db->prepare(
            "UPDATE pages SET status = 'draft', updated_by = ? WHERE id = ?"
        );
        $stmt->execute([$userId, $id]);
        Response::json(['message' => 'Page status changed to Draft successfully']);
    }

    // Admin: Delete Page
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM pages WHERE id = ?");
        $stmt->execute([$id]);
        Response::json(['message' => 'Page deleted successfully']);
    }

    // Admin: Duplicate Page
    public function duplicate($id, $currentUser) {
        $userId = $currentUser['userId'];
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("SELECT * FROM pages WHERE id = ?");
            $stmt->execute([$id]);
            $page = $stmt->fetch();

            if (!$page) {
                throw new Exception('Page not found');
            }

            // Create unique slug & title
            $newTitle = $page['title'] . " (Copy)";
            $newSlug = $page['slug'] . "-copy-" . time();
            $newRoute = $page['route'] . "-copy";

            $stmt = $this->db->prepare(
                "INSERT INTO pages (slug, title, route, template, status, hero_title, hero_subtitle, hero_image, meta_title, meta_description, meta_keywords, og_image, canonical_url, created_by, updated_by)
                 VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $newSlug, $newTitle, $newRoute, $page['template'],
                $page['hero_title'], $page['hero_subtitle'], $page['hero_image'],
                $page['meta_title'], $page['meta_description'], $page['meta_keywords'],
                $page['og_image'], $page['canonical_url'],
                $userId, $userId
            ]);
            $newPageId = $this->db->lastInsertId();

            // Duplicate blocks
            $stmt = $this->db->prepare("SELECT * FROM blocks WHERE page_id = ? ORDER BY sort_order ASC");
            $stmt->execute([$id]);
            $blocks = $stmt->fetchAll();

            foreach ($blocks as $block) {
                $bStmt = $this->db->prepare(
                    "INSERT INTO blocks (page_id, block_type, sort_order, data, status, created_by, updated_by) VALUES (?, ?, ?, ?, 'draft', ?, ?)"
                );
                $bStmt->execute([
                    $newPageId, $block['block_type'], $block['sort_order'],
                    $block['data'], $userId, $userId
                ]);
            }

            $this->db->commit();
            Response::json(['message' => 'Page duplicated successfully', 'new_page_id' => $newPageId]);

        } catch (Exception $e) {
            $this->db->rollBack();
            Response::json(['error' => 'Failed to duplicate page: ' . $e->getMessage()], 500);
        }
    }
}
?>
