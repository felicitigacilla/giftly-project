<?php
// api/config/database.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection (PostgreSQL via PDO with compatibility wrapper)
// Prefer database env vars in any common Render/Postgres format
$databaseUrl = getenv('DATABASE_URL') ?: getenv('PG_URI') ?: false;
if ($databaseUrl) {
    $parts = parse_url($databaseUrl);
    $host = $parts['host'] ?? getenv('DB_HOST') ?: 'localhost';
    $user = $parts['user'] ?? getenv('DB_USERNAME') ?: getenv('PGUSER') ?: 'postgres';
    $password = $parts['pass'] ?? getenv('DB_PASSWORD') ?: getenv('PGPASSWORD') ?: '';
    $database = isset($parts['path']) ? ltrim($parts['path'], '/') : (getenv('DB_DATABASE') ?: getenv('PGDATABASE') ?: 'giftly_db');
    $port = $parts['port'] ?? (getenv('DB_PORT') ?: getenv('PGPORT') ?: null);
} else {
    $host = getenv('DB_HOST') ?: getenv('PGHOST') ?: 'localhost';
    $user = getenv('DB_USERNAME') ?: getenv('PGUSER') ?: 'postgres';
    $password = getenv('DB_PASSWORD') ?: getenv('PGPASSWORD') ?: '';
    $database = getenv('DB_DATABASE') ?: getenv('PGDATABASE') ?: 'giftly_db';
    $port = getenv('DB_PORT') ?: getenv('PGPORT') ?: null;
}

// Include a minimal DBCompat if not already loaded (keeps API similar to the rest of the app)
if (!class_exists('DBCompat')) {
    class DBResult {
        private $rows = [];
        private $pointer = 0;
        public $num_rows = 0;
        public function __construct($stmt) {
            if ($stmt instanceof PDOStatement) {
                $this->rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $this->num_rows = count($this->rows);
            }
        }
        public function fetch_assoc() {
            if ($this->pointer < count($this->rows)) {
                return $this->rows[$this->pointer++];
            }
            return null;
        }
    }
    class DBCompat {
        public $pdo = null;
        public $connect_error = '';
        public $insert_id = null;
        public $error = '';
        public function __construct($host, $user, $pass, $dbname, $port = null) {
            $dsn = "pgsql:host=$host;dbname=$dbname";
            if ($port) {
                $dsn .= ";port=$port";
            }
            if ($host !== 'localhost' && $host !== '127.0.0.1' && stripos($host, 'localhost') === false) {
                $dsn .= ";sslmode=require";
            }
            try {
                $this->pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            } catch (PDOException $e) {
                $this->connect_error = $e->getMessage();
                $this->error = $e->getMessage();
            }
        }
        public function real_escape_string($str) {
            if ($this->pdo) {
                $q = $this->pdo->quote((string)$str);
                if ($q === false) return addslashes((string)$str);
                if (strlen($q) >= 2 && $q[0] === "'" && $q[strlen($q)-1] === "'") return substr($q,1,-1);
                return $q;
            }
            return addslashes((string)$str);
        }
        public function query($sql) {
            $trim = ltrim($sql);
            $prefix = strtoupper(substr($trim,0,6));
            try {
                if (strpos($prefix,'SELECT') === 0 || strtoupper(substr($trim,0,4)) === 'WITH') {
                    $stmt = $this->pdo->query($sql);
                    return new DBResult($stmt);
                } else {
                    $res = $this->pdo->exec($sql);
                    try { $last = $this->pdo->lastInsertId(); if ($last !== false) $this->insert_id = $last; } catch (Exception $e) {}
                    return $res !== false ? true : false;
                }
            } catch (PDOException $e) {
                $this->connect_error = $e->getMessage();
                $this->error = $e->getMessage();
                return false;
            }
        }
        public function begin_transaction() { try { return $this->pdo->beginTransaction(); } catch (PDOException $e) { $this->error = $e->getMessage(); return false; } }
        public function commit() { try { return $this->pdo->commit(); } catch (PDOException $e) { $this->error = $e->getMessage(); return false; } }
        public function rollback() { try { return $this->pdo->rollBack(); } catch (PDOException $e) { $this->error = $e->getMessage(); return false; } }
    }
}

$conn = new DBCompat($host, $user, $password, $database, $port ?? null);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]));
}

// Function to send JSON response
function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// Function to send error response
function sendError($message, $status = 400) {
    sendResponse(['error' => $message, 'status' => 'error'], $status);
}

// Function to send success response
function sendSuccess($data = null, $message = 'Success') {
    sendResponse(['status' => 'success', 'message' => $message, 'data' => $data]);
}
?>