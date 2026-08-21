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

$category_name = trim($data["category_name"] ?? "");
$role = trim($data["role"] ?? "");

if ($role !== "owner") {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized access"
    ]);
    exit;
}

if ($category_name === "") {
    echo json_encode([
        "success" => false,
        "message" => "Category name is required"
    ]);
    exit;
}

$checkSql = "SELECT category_id FROM category WHERE category_name = ?";
$checkStmt = sqlsrv_query($conn, $checkSql, [$category_name]);

if (sqlsrv_fetch_array($checkStmt, SQLSRV_FETCH_ASSOC)) {
    echo json_encode([
        "success" => false,
        "message" => "Category already exists"
    ]);
    exit;
}

$insertSql = "INSERT INTO category (category_name) VALUES (?)";
$stmt = sqlsrv_query($conn, $insertSql, [$category_name]);

if ($stmt === false) {
    echo json_encode([
        "success" => false,
        "error" => sqlsrv_errors()
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Category added successfully"
]);
?>