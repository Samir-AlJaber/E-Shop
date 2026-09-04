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
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized"
    ]);
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
    p.name AS product_name,
    oi.quantity,
    c.name AS customer_name,
    c.email AS customer_email,
    s.name AS delivery_man_name,
    s.email AS delivery_man_email,
    dr.rating AS delivery_rating,
    dr.feedback AS delivery_feedback
FROM orders o
JOIN customer c 
ON o.customer_id = c.customer_id
LEFT JOIN salesman s
ON o.salesman_id = s.salesman_id
LEFT JOIN delivery_rating dr
ON o.order_id = dr.order_id
JOIN order_item oi
ON o.order_id = oi.order_id
JOIN product p
ON oi.product_id = p.product_id
WHERE o.owner_id = ?
ORDER BY o.order_date DESC
";

$stmt = sqlsrv_query($conn, $sql, [$owner_id]);

if ($stmt === false) {

    echo json_encode([
        "success" => false,
        "message" => "Database query failed"
    ]);

    exit;
}

$orders = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    if ($row["delivery_rating"] !== null) {
        $row["delivery_rating"] = intval($row["delivery_rating"]);
    }
    $orders[] = $row;
}

echo json_encode([
    "success" => true,
    "orders" => $orders
]);
?>