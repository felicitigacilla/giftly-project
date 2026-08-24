<?php
// PostgreSQL compatibility wrapper using PDO (pgsql)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
            if (strlen($q) >= 2 && $q[0] === "'" && $q[strlen($q)-1] === "'") {
                return substr($q, 1, -1);
            }
            return $q;
        }
        return addslashes((string)$str);
    }

    public function query($sql) {
        $trim = ltrim($sql);
        $prefix = strtoupper(substr($trim, 0, 6));
        try {
            if (strpos($prefix, 'SELECT') === 0 || strtoupper(substr($trim,0,4)) === 'WITH') {
                $stmt = $this->pdo->query($sql);
                return new DBResult($stmt);
            } else {
                $res = $this->pdo->exec($sql);
                try {
                    $last = $this->pdo->lastInsertId();
                    if ($last !== false) $this->insert_id = $last;
                } catch (Exception $e) {
                    // ignore
                }
                return $res !== false ? true : false;
            }
        } catch (PDOException $e) {
            $this->connect_error = $e->getMessage();
            $this->error = $e->getMessage();
            return false;
        }
    }

    public function begin_transaction() {
        try {
            return $this->pdo->beginTransaction();
        } catch (PDOException $e) {
            $this->error = $e->getMessage();
            return false;
        }
    }

    public function commit() {
        try {
            return $this->pdo->commit();
        } catch (PDOException $e) {
            $this->error = $e->getMessage();
            return false;
        }
    }

    public function rollback() {
        try {
            return $this->pdo->rollBack();
        } catch (PDOException $e) {
            $this->error = $e->getMessage();
            return false;
        }
    }
}

// Connection settings - support DATABASE_URL / PG* / Render DB_* environment formats
$databaseUrl = getenv('DATABASE_URL') ?: getenv('PG_URI') ?: false;
if ($databaseUrl) {
    $parts = parse_url($databaseUrl);
    $host = $parts['host'] ?? getenv('DB_HOST') ?: 'localhost';
    $user = $parts['user'] ?? getenv('DB_USERNAME') ?: getenv('PGUSER') ?: 'postgres';
    $pass = $parts['pass'] ?? getenv('DB_PASSWORD') ?: getenv('PGPASSWORD') ?: '';
    $dbname = isset($parts['path']) ? ltrim($parts['path'], '/') : (getenv('DB_DATABASE') ?: getenv('PGDATABASE') ?: 'giftly_db');
    $port = $parts['port'] ?? (getenv('DB_PORT') ?: getenv('PGPORT') ?: null);
} else {
    $host = getenv('DB_HOST') ?: getenv('PGHOST') ?: 'localhost';
    $user = getenv('DB_USERNAME') ?: getenv('PGUSER') ?: 'postgres';
    $pass = getenv('DB_PASSWORD') ?: getenv('PGPASSWORD') ?: '';
    $dbname = getenv('DB_DATABASE') ?: getenv('PGDATABASE') ?: 'giftly_db';
    $port = getenv('DB_PORT') ?: getenv('PGPORT') ?: null;
}

// Create a DBCompat instance and expose it as $conn
$conn = new DBCompat($host, $user, $pass, $dbname, $port);

// 2. Start Session to remember the user
session_start();

// 3. Set timezone
date_default_timezone_set('Asia/Manila');
?>