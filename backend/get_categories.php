<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

include "db.php";

$sql = "SELECT category_id, category_name FROM category ORDER BY category_name ASC";
$stmt = sqlsrv_query($conn, $sql);

if ($stmt === false) {
    echo json_encode([
        "success" => false,
        "error" => sqlsrv_errors()
    ]);
    exit;
}

$categories = [];

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $categories[] = $row;
}

echo json_encode([
    "success" => true,
    "categories" => $categories
]);
?>