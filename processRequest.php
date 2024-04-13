<?php
// processRequest.php

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405); // Method Not Allowed
    exit("Method Not Allowed");
}

// Connection information
$serverName = ".\SQLEXPRESS"; // Adjust if necessary
$connectionOptions = array(
    "Database" => "gameDB", // Your database name
    "UID" => "", // Not needed for Windows Authentication
    "PWD" => "", // Not needed for Windows Authentication
    "CharacterSet" => "UTF-8"
);

// Connect using SQLSRV
$conn = sqlsrv_connect($serverName, $connectionOptions);

// Check the connection
if ($conn === false) {
    die(print_r(sqlsrv_errors(), true));
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Check if the required parameters are present
    if (!isset($_POST['radioValue']) || !isset($_POST['textInputValue'])) {
        die("Invalid request: Missing parameters");
    }

    // Get data from AJAX request and sanitize input
    $radioValue = htmlspecialchars($_POST['radioValue'], ENT_QUOTES, 'UTF-8');
    $textInputValue = htmlspecialchars($_POST['textInputValue'], ENT_QUOTES, 'UTF-8');

    // Validate $radioValue
    $validTables = ['Country', 'City', 'Animal', 'Plant', 'Object', 'BoyName', 'GirlName', 'Profession', 'Celebrity'];
    if (!in_array($radioValue, $validTables)) {
        die("Invalid table name");
    }

    // Prepare your SQL query with parameterized query
    $columnName = $radioValue . "Name";
    $query = "SELECT * FROM $radioValue WHERE $columnName LIKE ?";
    $stmt = sqlsrv_prepare($conn, $query, array(&$textInputValue));

    // Execute the query
    if (!sqlsrv_execute($stmt)) {
        die("Query execution failed: " . print_r(sqlsrv_errors(), true));
    }

    // Fetch the results
    $data = array();
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $data[] = $row;
    }

    // Send back the data as JSON
    echo json_encode($data);
} else {
    echo "Invalid request";
}

// Close the database connection
sqlsrv_close($conn);
?>
