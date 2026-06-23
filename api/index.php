<?php
// api/index.php

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Security Headers
header("X-Frame-Options: DENY");
header("X-Content-Type-Options: nosniff");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none';");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    http_response_code(200);
    exit();
}

// Require configuration & helpers
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/Response.php';
require_once __DIR__ . '/middleware/Auth.php';

// Controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/PageController.php';
require_once __DIR__ . '/controllers/BlockController.php';
require_once __DIR__ . '/controllers/RevisionController.php';
require_once __DIR__ . '/controllers/MediaController.php';
require_once __DIR__ . '/controllers/TCController.php';
require_once __DIR__ . '/controllers/SettingsController.php';
require_once __DIR__ . '/controllers/HomepageController.php';
require_once __DIR__ . '/controllers/BackupController.php';
require_once __DIR__ . '/controllers/ContactController.php';

// Instantiate DB & Controllers
$dbClass = new Database();
$db = $dbClass->getConnection();

$authController = new AuthController($db);
$pageController = new PageController($db);
$blockController = new BlockController($db);
$revisionController = new RevisionController($db);
$mediaController = new MediaController($db);
$tcController = new TCController($db);
$settingsController = new SettingsController($db);
$homepageController = new HomepageController($db);
$backupController = new BackupController($db);
$contactController = new ContactController($db);

// Parse request URI and method
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Clean query string from URI
$parsedUrl = parse_url($requestUri);
$path = isset($parsedUrl['path']) ? $parsedUrl['path'] : '';

// Remove base path if run from subdirectory (e.g. /api/)
$apiPos = strpos($path, '/api/');
if ($apiPos !== false) {
    $path = substr($path, $apiPos + 4); // Keep leading slash, so '/api/auth/login' -> '/auth/login'
}

// Helper to check authentication
function getAuthenticatedUser() {
    return Auth::authenticate();
}

// Router matcher
switch (true) {
    // === AUTHENTICATION ===
    case ($path === '/auth/login' && $requestMethod === 'POST'):
        $authController->login();
        break;

    case ($path === '/auth/me' && $requestMethod === 'GET'):
        $user = getAuthenticatedUser();
        $authController->me($user);
        break;

    case ($path === '/auth/forgot-password' && $requestMethod === 'POST'):
        $authController->forgotPassword();
        break;

    case ($path === '/auth/reset-password' && $requestMethod === 'POST'):
        $authController->resetPassword();
        break;

    case ($path === '/auth/change-password' && $requestMethod === 'PUT'):
        $user = getAuthenticatedUser();
        $authController->changePassword($user);
        break;

    // === PAGES - PUBLIC ===
    case ($path === '/pages' && $requestMethod === 'GET'):
        $pageController->listPublished();
        break;

    case (preg_match('#^/pages/(.+)$#', $path, $matches) && $requestMethod === 'GET'):
        $pageController->getBySlug($matches[1]);
        break;

    // === PAGES - ADMIN ===
    case ($path === '/admin/pages' && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $pageController->adminList();
        break;

    case (preg_match('#^/admin/pages/(\d+)$#', $path, $matches) && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $pageController->adminGet((int)$matches[1]);
        break;

    case ($path === '/admin/pages' && $requestMethod === 'POST'):
        $user = getAuthenticatedUser();
        $pageController->create($user);
        break;

    case (preg_match('#^/admin/pages/(\d+)$#', $path, $matches) && $requestMethod === 'PUT'):
        $user = getAuthenticatedUser();
        $pageController->update((int)$matches[1], $user);
        break;

    case (preg_match('#^/admin/pages/(\d+)$#', $path, $matches) && $requestMethod === 'DELETE'):
        getAuthenticatedUser();
        $pageController->delete((int)$matches[1]);
        break;

    case (preg_match('#^/admin/pages/(\d+)/publish$#', $path, $matches) && $requestMethod === 'POST'):
        $user = getAuthenticatedUser();
        $pageController->publish((int)$matches[1], $user);
        break;

    case (preg_match('#^/admin/pages/(\d+)/unpublish$#', $path, $matches) && $requestMethod === 'POST'):
        $user = getAuthenticatedUser();
        $pageController->unpublish((int)$matches[1], $user);
        break;

    case (preg_match('#^/admin/pages/(\d+)/duplicate$#', $path, $matches) && $requestMethod === 'POST'):
        $user = getAuthenticatedUser();
        $pageController->duplicate((int)$matches[1], $user);
        break;

    // === BLOCKS - ADMIN ===
    case ($path === '/admin/blocks' && $requestMethod === 'POST'):
        $user = getAuthenticatedUser();
        $blockController->create($user);
        break;

    case (preg_match('#^/admin/blocks/(\d+)$#', $path, $matches) && $requestMethod === 'PUT'):
        $user = getAuthenticatedUser();
        $blockController->update((int)$matches[1], $user);
        break;

    case (preg_match('#^/admin/blocks/(\d+)$#', $path, $matches) && $requestMethod === 'DELETE'):
        $user = getAuthenticatedUser();
        $blockController->delete((int)$matches[1], $user);
        break;

    case (preg_match('#^/admin/pages/(\d+)/blocks/reorder$#', $path, $matches) && $requestMethod === 'PUT'):
        $user = getAuthenticatedUser();
        $blockController->reorder((int)$matches[1], $user);
        break;

    case (preg_match('#^/admin/blocks/(\d+)/toggle-visibility$#', $path, $matches) && $requestMethod === 'POST'):
        $user = getAuthenticatedUser();
        $blockController->toggleVisibility((int)$matches[1], $user);
        break;

    // === REVISIONS - ADMIN ===
    case (preg_match('#^/admin/pages/(\d+)/revisions$#', $path, $matches) && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $revisionController->getPageRevisions((int)$matches[1]);
        break;

    case (preg_match('#^/admin/pages/(\d+)/rollback/(\d+)$#', $path, $matches) && $requestMethod === 'POST'):
        $user = getAuthenticatedUser();
        $revisionController->rollbackPage((int)$matches[1], (int)$matches[2], $user);
        break;

    // === MEDIA - ADMIN ===
    case ($path === '/admin/media' && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $mediaController->list();
        break;

    case ($path === '/admin/media/upload' && $requestMethod === 'POST'):
        $user = getAuthenticatedUser();
        $mediaController->upload($user);
        break;

    case (preg_match('#^/admin/media/(\d+)$#', $path, $matches) && $requestMethod === 'PUT'):
        getAuthenticatedUser();
        $mediaController->update((int)$matches[1]);
        break;

    case (preg_match('#^/admin/media/(\d+)$#', $path, $matches) && $requestMethod === 'DELETE'):
        getAuthenticatedUser();
        $mediaController->delete((int)$matches[1]);
        break;

    case (preg_match('#^/admin/media/(\d+)/usage$#', $path, $matches) && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $mediaController->getUsage((int)$matches[1]);
        break;

    // === TRANSFER CERTIFICATES ===
    case (($path === '/certificates/search' || $path === '/public/certificates/search') && ($requestMethod === 'POST' || $requestMethod === 'GET')):
        $tcController->search();
        break;

    case ($path === '/admin/certificates' && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $tcController->list();
        break;

    case ($path === '/admin/certificates' && $requestMethod === 'POST'):
        $user = getAuthenticatedUser();
        $tcController->create($user);
        break;

    case (preg_match('#^/admin/certificates/(\d+)$#', $path, $matches) && $requestMethod === 'POST'): // Handle POST with multipart/form-data for updates
        $user = getAuthenticatedUser();
        $tcController->update((int)$matches[1], $user);
        break;

    case (preg_match('#^/admin/certificates/(\d+)$#', $path, $matches) && $requestMethod === 'DELETE'):
        getAuthenticatedUser();
        $tcController->delete((int)$matches[1]);
        break;

    // === SITE SETTINGS ===
    case ($path === '/settings' && $requestMethod === 'GET'):
        $settingsController->getPublic();
        break;

    case ($path === '/admin/settings' && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $settingsController->adminGet();
        break;

    case ($path === '/admin/settings' && $requestMethod === 'PUT'):
        $user = getAuthenticatedUser();
        $settingsController->adminSave($user);
        break;

    // === HOMEPAGE SECTIONS ===
    case ($path === '/homepage/sections' && $requestMethod === 'GET'):
        $homepageController->getPublic();
        break;

    case ($path === '/admin/homepage/sections' && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $homepageController->adminList();
        break;

    case ($path === '/admin/homepage/sections/order' && $requestMethod === 'PUT'):
        $user = getAuthenticatedUser();
        $homepageController->updateOrder($user);
        break;

    case (preg_match('#^/admin/homepage/sections/([^/]+)$#', $path, $matches) && $requestMethod === 'PUT'):
        $user = getAuthenticatedUser();
        $homepageController->updateSection($matches[1], $user);
        break;

    // === BACKUP & RESTORE ===
    case ($path === '/admin/backups' && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $backupController->listBackups();
        break;

    case ($path === '/admin/backups' && $requestMethod === 'POST'):
        getAuthenticatedUser();
        $backupController->createBackup();
        break;

    case (preg_match('#^/admin/backups/download/([^/]+)$#', $path, $matches) && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $backupController->downloadBackup($matches[1]);
        break;

    case ($path === '/admin/backups/restore' && $requestMethod === 'POST'):
        getAuthenticatedUser();
        $backupController->restoreBackup();
        break;

    case (preg_match('#^/admin/backups/([^/]+)$#', $path, $matches) && $requestMethod === 'DELETE'):
        getAuthenticatedUser();
        $backupController->deleteBackup($matches[1]);
        break;

    // === CONTACT FORM SUBMISSIONS ===
    case ($path === '/contact' && $requestMethod === 'POST'):
        $contactController->submit();
        break;

    case ($path === '/admin/contact-submissions' && $requestMethod === 'GET'):
        getAuthenticatedUser();
        $contactController->list();
        break;

    case (preg_match('#^/admin/contact-submissions/(\d+)$#', $path, $matches) && $requestMethod === 'DELETE'):
        getAuthenticatedUser();
        $contactController->delete((int)$matches[1]);
        break;

    // === FALLTHROUGH - NOT FOUND ===
    default:
        Response::json(['error' => 'API endpoint not found: ' . $path], 404);
        break;
}
?>
