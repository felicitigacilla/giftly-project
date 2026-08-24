<?php
// 1. DATABASE AND SESSION MUST BE FIRST
include 'db_connect.php'; 

if (isset($_POST['login'])) {
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    // 🚨 Get the redirect URL from the form
    $redirect_to = isset($_POST['redirect_to']) ? $_POST['redirect_to'] : 'index.php';
    
    // 🚨 Clean up the redirect URL - remove any existing error parameters
    $redirect_to = strtok($redirect_to, '?');
    
    // 🚨 If the redirect URL is empty or just the domain, use index.php
    if (empty($redirect_to) || $redirect_to == 'http://localhost/giftly_project/' || $redirect_to == 'http://localhost/') {
        $redirect_to = 'index.php';
    }

    $sql = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        
        if (password_verify($password, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_name'] = $row['name'];
            
            // 🚀 THIS SETS THE FRESH LOGIN TRIGGER
            $_SESSION['fresh_login_modal'] = true; 
            
            // ALWAYS redirect to index.php so the modals can trigger properly
            header("Location: index.php");
            exit();
        } else {
            // 🚨 Redirect back with error - preserve the redirect URL
            header("Location: " . $redirect_to . "?login_error=incorrect");
            exit();
        }
    } else {
        // 🚨 Redirect back with error - preserve the redirect URL
        header("Location: " . $redirect_to . "?login_error=notfound");
        exit();
    }
}

// If this page is loaded directly (not from the modal), redirect to homepage
if (!isset($_GET['login_error'])) {
    header("Location: index.php");
    exit();
}

// 3. LOAD HEADER ONLY AFTER PHP LOGIC
include 'header.php'; 
?>