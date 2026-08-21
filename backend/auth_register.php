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

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";
$role = trim($data["role"] ?? "");

$errors = [];

/* Validate role */
if (!in_array($role, ['owner', 'salesman', 'customer'])) {
    $errors["role"] = "Invalid role selected";
}

/* Email validation */
if (!str_ends_with($email, "@gmail.com")) {
    $errors["email"] = "Email must end with @gmail.com";
}

/* Password validation */
if (strlen($password) < 8) {
    $errors["password"] = "Password must be at least 8 characters";
}
elseif (!preg_match('/[A-Z]/', $password)) {
    $errors["password"] = "Must contain at least 1 uppercase letter";
}
elseif (!preg_match('/[a-z]/', $password)) {
    $errors["password"] = "Must contain at least 1 lowercase letter";
}
elseif (!preg_match('/[0-9]/', $password)) {
    $errors["password"] = "Must contain at least 1 number";
}

if (!empty($errors)) {
    echo json_encode(["success" => false, "errors" => $errors]);
    exit;
}

/* Check duplicate email in user_account */
$checkSql = "SELECT user_id FROM user_account WHERE email = ?";
$checkStmt = sqlsrv_query($conn, $checkSql, [$email]);

if ($checkStmt === false) {
    echo json_encode([
        "success" => false,
        "message" => "Email check failed",
        "error" => sqlsrv_errors()
    ]);
    exit;
}

if (sqlsrv_fetch_array($checkStmt, SQLSRV_FETCH_ASSOC)) {
    echo json_encode([
        "success" => false,
        "errors" => ["email" => "Email already registered"]
    ]);
    exit;
}

/* Hash password */
$pass_hash = password_hash($password, PASSWORD_BCRYPT);

/* Insert into role table */
if ($role === "owner") {
    $sql = "INSERT INTO owner (username, email, password_hash)
            OUTPUT INSERTED.owner_id
            VALUES (?, ?, ?)";
}
elseif ($role === "salesman") {
    $sql = "INSERT INTO salesman (name, email, password_hash)
            OUTPUT INSERTED.salesman_id
            VALUES (?, ?, ?)";
}
else {
    $sql = "INSERT INTO customer (name, email, password_hash)
            OUTPUT INSERTED.customer_id
            VALUES (?, ?, ?)";
}

$stmt = sqlsrv_query($conn, $sql, [$name, $email, $pass_hash]);

if ($stmt === false) {
    echo json_encode([
        "success" => false,
        "message" => "Role insert failed",
        "error" => sqlsrv_errors()
    ]);
    exit;
}

/* Fetch inserted ID */
$row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if (!$row) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve inserted ID"
    ]);
    exit;
}

$reference_id = array_values($row)[0];

/* Insert into user_account */
$userSql = "INSERT INTO user_account (email, password_hash, role, reference_id)
            VALUES (?, ?, ?, ?)";

$userStmt = sqlsrv_query($conn, $userSql, [$email, $pass_hash, $role, $reference_id]);

if ($userStmt === false) {
    echo json_encode([
        "success" => false,
        "message" => "User account creation failed",
        "error" => sqlsrv_errors()
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Registration successful"
]);
?>