<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$dsn = "mysql:host=localhost;dbname=xss;charset=utf8mb4";
$username = "root";
$password = ""; // keep empty if using default XAMPP MySQL

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    // create table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS entries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            content TEXT NOT NULL,
            mode ENUM('safe','unsafe') NOT NULL DEFAULT 'unsafe',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
} catch (Exception $e) {
    http_response_code(500);
    die("DB connection failed: " . $e->getMessage());
}

// Handle OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/stored' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['content']) || !isset($data['mode'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }

    $content = $data['content'];
    $mode = $data['mode'];

    function escapeHtml($s) {
        return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
    }

    $toStore = $mode === 'safe' ? escapeHtml($content) : $content;

    $stmt = $pdo->prepare("INSERT INTO entries (content, mode) VALUES (?, ?)");
    $stmt->execute([$toStore, $mode]);

    echo json_encode(["message" => "Saved in $mode mode."]);
}
elseif ($uri === '/storedFetch' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM entries ORDER BY created_at DESC");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    header('Content-Type: application/json');
    echo json_encode($rows);
}
else {
    // Default route (like your reflected XSS demo)
    $userInput = $_GET['userInput'] ?? '';
    echo "<html><body><h2>Welcome!</h2><p>You searched for: $userInput</p></body></html>";
}
?>
