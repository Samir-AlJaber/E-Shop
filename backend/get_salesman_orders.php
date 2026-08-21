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

$salesman_id = intval($data["salesman_id"] ?? 0);

if ($salesman_id <= 0) {
    echo json_encode(["success" => false]);
    exit;
}

$sql = "
SELECT 
    o.order_id,
    o.customer_id,
    o.salesman_id,
    o.total_amount,
    o.status,
    o.delivery_address,
    o.city,
    o.postal_code,
    o.payment_method,
    c.name AS customer_name,
    c.email AS customer_email
FROM orders o
JOIN customer c ON o.customer_id = c.customer_id
WHERE (o.salesman_id = ? OR o.status = 'delivery_rejected')
ORDER BY o.order_id DESC
";

$stmt = sqlsrv_query($conn, $sql, [$salesman_id]);

if ($stmt === false) {
    echo json_encode(["success" => false]);
    exit;
}

$orders = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $orders[] = $row;
}

$rating = 0;

$rating_sql = "SELECT rating FROM salesman WHERE salesman_id = ?";
$rating_stmt = sqlsrv_query($conn, $rating_sql, [$salesman_id]);

if ($rating_stmt !== false) {
    $row = sqlsrv_fetch_array($rating_stmt, SQLSRV_FETCH_ASSOC);
    if ($row) {
        $rating = floatval($row["rating"]);
    }
}

$total_deliveries = 0;

$delivery_sql = "
SELECT COUNT(*) AS total_deliveries
FROM orders
WHERE salesman_id = ? AND status = 'delivered'
";

$delivery_stmt = sqlsrv_query($conn, $delivery_sql, [$salesman_id]);

if ($delivery_stmt !== false) {
    $row = sqlsrv_fetch_array($delivery_stmt, SQLSRV_FETCH_ASSOC);
    if ($row) {
        $total_deliveries = intval($row["total_deliveries"]);
    }
}

echo json_encode([
    "success" => true,
    "orders" => $orders,
    "rating" => $rating,
    "total_deliveries" => $total_deliveries
]);
?>