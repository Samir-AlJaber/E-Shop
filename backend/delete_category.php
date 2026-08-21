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

$category_id = intval($data["category_id"] ?? 0);
$role = trim($data["role"] ?? "");

if ($role !== "owner") {
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized access"
    ]);
    exit;
}

if ($category_id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid category ID"
    ]);
    exit;
}

$checkSql = "SELECT COUNT(*) AS total FROM product WHERE category_id = ?";
$checkStmt = sqlsrv_query($conn, $checkSql, [$category_id]);

if ($checkStmt === false) {
    echo json_encode(["success" => false]);
    exit;
}

$row = sqlsrv_fetch_array($checkStmt, SQLSRV_FETCH_ASSOC);

if ($row["total"] > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Cannot delete category. Products exist under this category."
    ]);
    exit;
}

$deleteSql = "DELETE FROM category WHERE category_id = ?";
$deleteStmt = sqlsrv_query($conn, $deleteSql, [$category_id]);

if ($deleteStmt === false) {
    echo json_encode(["success" => false]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Category deleted successfully"
]);
?>