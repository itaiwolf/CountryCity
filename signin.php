<?php
session_start();

// Dummy user credentials for demonstration purposes
$valid_username = "user";
$valid_password = "password";

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve username and password from form
    $username = $_POST["username"];
    $password = $_POST["password"];

    // Check if username and password match the valid credentials
    if ($username === $valid_username && $password === $valid_password) {
        // Authentication successful
        $_SESSION["username"] = $username;
        header("Location: game.php"); // Redirect to the game page
        exit();
    } else {
        // Authentication failed
        $error_message = "Invalid username or password. Please try again.";
    }
}
?>
