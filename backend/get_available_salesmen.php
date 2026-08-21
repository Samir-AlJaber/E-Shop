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

$owner_id = $data["owner_id"] ?? null;

if (!$owner_id) {
    echo json_encode(["success" => false]);
    exit;
}

$sql = "
SELECT s.salesman_id, s.name, s.email, s.rating
FROM salesman s
WHERE s.status = 'active'
AND s.salesman_id NOT IN (
    SELECT salesman_id
    FROM orders
    WHERE status IN ('waiting_delivery_acceptance','out_for_delivery')
    AND salesman_id IS NOT NULL
)
ORDER BY s.rating DESC
";

$stmt = sqlsrv_query($conn, $sql);

if ($stmt === false) {
    echo json_encode(["success" => false]);
    exit;
}

$salesmen = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $salesmen[] = $row;
}

echo json_encode([
    "success" => true,
    "salesmen" => $salesmen
]);
?>