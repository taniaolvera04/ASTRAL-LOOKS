<?php
require_once "bd.php";
error_reporting(0); // Agrega esta línea para desactivar los errores visibles.
ini_set('display_errors', 0); // Evitar que los errores salgan en la respuesta JSON.

header('Content-Type: application/json; charset=utf-8');
$response = ['success' => false, 'mensaje' => ''];
session_start();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $action = $_POST['action'] ?? '';

        switch ($action) {
            case 'register':
                $name = trim($_POST['name'] ?? '');
                $email = trim($_POST['email'] ?? '');
                $password = trim($_POST['password'] ?? '');

                if (empty($name) || empty($email) || empty($password)) {
                    $response['mensaje'] = "Todos los campos son obligatorios.";
                    break;
                }

                $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
                $profilePicture = 'assets/imgUsers/icon.png';

                $sql = "INSERT INTO users (name, email, password, foto) VALUES (?, ?, ?, ?)";
                $stmt = $cx->prepare($sql);
                $stmt->bind_param("ssss", $name, $email, $hashedPassword, $profilePicture);

                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['mensaje'] = "Registro exitoso, $name.";
                } else {
                    $response['mensaje'] = "Error al registrar al usuario: " . $cx->error;
                }
                break;

            case 'login':
                $email = trim($_POST['email'] ?? '');
                $password = trim($_POST['password'] ?? '');

                $sql = "SELECT id, name, password, foto FROM users WHERE email = ?";
                $stmt = $cx->prepare($sql);
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows > 0) {
                    $user = $result->fetch_assoc();
                    if (password_verify($password, $user['password'])) {
                        $_SESSION['id'] = $user['id'];
                        $_SESSION['name'] = $user['name'];
                        $_SESSION['foto'] = $user['foto'];

                        $response['success'] = true;
                        $response['mensaje'] = "Bienvenido, " . $user['name'];
                        $response['foto'] = $user['foto'];
                        $response['isAdmin'] = ($user['id'] === 1);
                    } else {
                        $response['mensaje'] = "Contraseña incorrecta.";
                    }
                } else {
                    $response['mensaje'] = "No existe una cuenta con este correo electrónico.";
                }
                break;

            case 'updateProfile':
                if (isset($_SESSION['id'])) {
                    $userId = $_SESSION['id'];
                    $nuevoNombre = trim($_POST['name'] ?? '');
                    $archivoSubido = $_FILES['photo'] ?? null;

                    if (empty($nuevoNombre)) {
                        $response['mensaje'] = 'El nombre no puede estar vacío.';
                        break;
                    }

                    $sql = "UPDATE users SET name = ? WHERE id = ?";
                    $stmt = $cx->prepare($sql);
                    $stmt->bind_param("si", $nuevoNombre, $userId);
                    if (!$stmt->execute()) {
                        $response['mensaje'] = 'Error al actualizar el nombre.';
                        break;
                    }

                    if ($archivoSubido && $archivoSubido['error'] === 0) {
                        $directorioDestino = $_SERVER['DOCUMENT_ROOT'] . "/01PROYECTO5/assets/imgUsers/";
                        $nombreArchivo = uniqid() . "_" . basename($archivoSubido['name']);
                        $rutaCompleta = $directorioDestino . $nombreArchivo;
                        
                        if (move_uploaded_file($archivoSubido['tmp_name'], $rutaCompleta)) {
                            $rutaRelativa = "/01PROYECTO5/assets/imgUsers/$nombreArchivo";
                            $sqlFoto = "UPDATE users SET foto = ? WHERE id = ?";
                            $stmtFoto = $cx->prepare($sqlFoto);
                            $stmtFoto->bind_param("si", $rutaRelativa, $userId);
                            if (!$stmtFoto->execute()) {
                                $response['mensaje'] = 'Error al guardar la foto.'. error_get_last()['message'];
                            }
                            $response['newPhoto'] = $rutaRelativa;
                        } else {
                            $response['mensaje'] = 'Error al mover el archivo.';
                            break;
                        }
                    }
                    

                    $response['success'] = true;
                    $response['mensaje'] = 'Perfil actualizado con éxito.';
                } else {
                    $response['mensaje'] = 'Sesión no iniciada.';
                }
                break;

            default:
                $response['mensaje'] = 'Acción no válida.';
        }
    } else {
        $response['mensaje'] = 'Método no permitido.';
    }
} catch (Exception $e) {
    $response['mensaje'] = 'Error inesperado: ' . $e->getMessage();
}

echo json_encode($response);
?>
