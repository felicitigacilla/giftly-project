<?php
// TURN ON FULL DEBUGGING (REMOVE THIS LATER)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include 'db_connect.php'; 

// If user is already logged in, send them straight to the shop
if (isset($_SESSION['user_id'])) {
    header("Location: shop.php");
    exit();
}

if (isset($_POST['register'])) {
    // 1. Capture ALL data correctly
    $firstname = isset($_POST['firstname']) ? mysqli_real_escape_string($conn, $_POST['firstname']) : '';
    $lastname  = isset($_POST['lastname']) ? mysqli_real_escape_string($conn, $_POST['lastname']) : '';
    $email     = isset($_POST['email']) ? mysqli_real_escape_string($conn, $_POST['email']) : '';
    $phone     = isset($_POST['phone']) ? mysqli_real_escape_string($conn, $_POST['phone']) : '';
    $password  = isset($_POST['password']) ? $_POST['password'] : '';
    $confirm   = isset($_POST['confirm_password']) ? $_POST['confirm_password'] : '';

    // 2. Basic Validations
    if ($password !== $confirm) {
        $redirect_to = isset($_POST['redirect_to']) ? $_POST['redirect_to'] : 'index.php';
        header("Location: " . $redirect_to . "?reg_msg=error&reg_error=Passwords do not match.");
        exit();
    }

    // 3. Check if email already exists
    $check = $conn->query("SELECT id FROM users WHERE email = '$email'");
    if ($check->num_rows > 0) {
        $redirect_to = isset($_POST['redirect_to']) ? $_POST['redirect_to'] : 'index.php';
        header("Location: " . $redirect_to . "?reg_msg=error&reg_error=Email is already registered.");
        exit();
    }

    // 4. Hash password and insert
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $fullname = $firstname . ' ' . $lastname;

    $sql = "INSERT INTO users (name, email, password, phone, role) 
            VALUES ('$fullname', '$email', '$hashed_password', '$phone', 'customer')";
    
    if ($conn->query($sql) === TRUE) {
        $redirect_to = isset($_POST['redirect_to']) ? $_POST['redirect_to'] : 'index.php';
        header("Location: " . $redirect_to . "?reg_msg=success");
        exit();
    } else {
        // 🚨 THIS WILL PRINT THE EXACT ERROR ON YOUR SCREEN
        die("Database Insert Failed: " . $conn->error);
    }
}

// If this page is loaded directly, redirect to homepage
header("Location: index.php");
exit();
?>