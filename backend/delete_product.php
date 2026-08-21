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

$product_id = intval($data["product_id"] ?? 0);
$role = trim($data["role"] ?? "");
$owner_id = intval($data["owner_id"] ?? 0);

if ($role !== "owner") {
    echo json_encode(["success" => false, "message" => "Unauthorized access"]);
    exit;
}

$sql = "UPDATE product SET is_deleted = 1 WHERE product_id = ? AND owner_id = ?";
$stmt = sqlsrv_query($conn, $sql, [$product_id, $owner_id]);

if ($stmt === false) {
    echo json_encode(sqlsrv_errors());
    exit;
}

if (sqlsrv_rows_affected($stmt) > 0) {
    echo json_encode(["success" => true, "message" => "Product deleted"]);
} else {
    echo json_encode(["success" => false, "message" => "Cannot delete this product"]);
}
?>