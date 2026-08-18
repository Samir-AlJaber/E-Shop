<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "email and password required"]);
    exit;
}

$sql = "SELECT id, name, email, password_hash, role
        FROM users
        WHERE email = ?";

$params = [$email];

$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    echo json_encode([
        "success" => false,
        "message" => "Query failed",
        "error" => sqlsrv_errors()
    ]);
    exit;
}

$user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

if (!password_verify($password, $user["password_hash"])) {
    echo json_encode(["success" => false, "message" => "Wrong password"]);
    exit;
}

unset($user["password_hash"]);

echo json_encode([
    "success" => true,
    "user" => $user
]);
?>