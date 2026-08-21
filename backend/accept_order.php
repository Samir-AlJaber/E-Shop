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

$order_id = intval($data["order_id"] ?? 0);
$owner_id = intval($data["owner_id"] ?? 0);
$role = trim($data["role"] ?? "");

if ($role !== "owner" || $order_id <= 0 || $owner_id <= 0) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$checkSql = "SELECT status FROM orders WHERE order_id = ? AND owner_id = ?";
$checkStmt = sqlsrv_query($conn, $checkSql, [$order_id, $owner_id]);

$order = sqlsrv_fetch_array($checkStmt, SQLSRV_FETCH_ASSOC);

if (!$order) {
    echo json_encode(["success" => false, "message" => "Order not found"]);
    exit;
}

if ($order["status"] !== "pending") {
    echo json_encode(["success" => false, "message" => "Order already processed"]);
    exit;
}

$updateSql = "UPDATE orders SET status = 'order_confirmed' WHERE order_id = ?";
$updateStmt = sqlsrv_query($conn, $updateSql, [$order_id]);

if ($updateStmt === false) {
    echo json_encode(["success" => false, "message" => "Update failed"]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Order confirmed"
]);
?>