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

$owner_id = intval($data["owner_id"] ?? 0);
$role = trim($data["role"] ?? "");

if ($role !== "owner" || $owner_id <= 0) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$sql = "
SELECT 
    o.order_id,
    o.status,
    o.total_amount,
    o.order_date,
    o.delivery_address,
    o.city,
    o.postal_code,
    o.payment_method,
    c.name AS customer_name,
    c.email AS customer_email
FROM orders o
JOIN customer c ON o.customer_id = c.customer_id
WHERE o.owner_id = ?
ORDER BY o.order_date DESC
";

$stmt = sqlsrv_query($conn, $sql, [$owner_id]);

if ($stmt === false) {
    echo json_encode(["success" => false]);
    exit;
}

$orders = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $orders[] = $row;
}

echo json_encode([
    "success" => true,
    "orders" => $orders
]);
?>