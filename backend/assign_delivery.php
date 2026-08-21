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

$order_id = $data["order_id"] ?? null;
$salesman_id = $data["salesman_id"] ?? null;
$owner_id = $data["owner_id"] ?? null;

if (!$order_id || !$salesman_id || !$owner_id) {
    echo json_encode(["success" => false]);
    exit;
}

$checkSql = "SELECT owner_id FROM orders WHERE order_id = ?";
$checkStmt = sqlsrv_query($conn, $checkSql, [$order_id]);

$row = sqlsrv_fetch_array($checkStmt, SQLSRV_FETCH_ASSOC);

if (!$row || $row["owner_id"] != $owner_id) {
    echo json_encode(["success" => false]);
    exit;
}

$updateSql = "
UPDATE orders
SET salesman_id = ?, status = 'waiting_delivery_acceptance'
WHERE order_id = ?
";

$updateStmt = sqlsrv_query($conn, $updateSql, [$salesman_id, $order_id]);

if ($updateStmt === false) {
    echo json_encode(["success" => false]);
    exit;
}

echo json_encode(["success" => true]);
?>