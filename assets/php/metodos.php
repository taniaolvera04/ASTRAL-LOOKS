<?php
require_once "bd.php";
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Mexico_City');

$valido['success'] = array('success' => false, 'mensaje' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    switch ($action) {

        case "guardar":
            $a = $_POST['producto'] ?? '';
            $e = intval($_POST['cantidad'] ?? 0);
        
            $fileName = $_FILES['img']['name'] ?? '';
            $fileTmpName = $_FILES['img']['tmp_name'] ?? '';
            $uploadDirectory = '../img_productos/';
        
            $valido = ['success' => false];
        
            // Validación de campos
            if (empty($a) || $e <= 0 || empty($fileName)) {
                $valido['mensaje'] = "Todos los campos son obligatorios.";
                echo json_encode($valido);
                break;
            }
        
            // Crear carpeta si no existe
            if (!is_dir($uploadDirectory)) {
                if (!mkdir($uploadDirectory, 0755, true)) {
                    $valido['mensaje'] = "Error al crear el directorio de imágenes.";
                    echo json_encode($valido);
                    break;
                }
            }
        
            // Ruta completa para guardar el archivo
            $filePath = $uploadDirectory . basename($fileName);
            $fileNameOnly = basename($fileName);
        
            // Subir archivo
            if (move_uploaded_file($fileTmpName, $filePath)) {
                $sqlInsertProducto = "INSERT INTO productos (producto, cantidad, imagen) VALUES (?, ?, ?)";
                $stmtProducto = $cx->prepare($sqlInsertProducto);
                $stmtProducto->bind_param("sis", $a, $e, $fileNameOnly);
        
                if ($stmtProducto->execute()) {
                    $id_p = $cx->insert_id;
                    $valido['success'] = true;
                    $valido['mensaje'] = "Producto agregado correctamente.";
                    $valido['id_p'] = $id_p;
                } else {
                    $valido['mensaje'] = "Error al guardar el producto en la base de datos: " . $cx->error;
                }
            } else {
                // Depuración adicional
                $error = error_get_last();
                $valido['mensaje'] = "Error al subir la imagen del producto. Detalle: " . ($error['message'] ?? 'Desconocido');
            }
        
            echo json_encode($valido);
            break;
        

        case "selectAll":
            $sql = "SELECT * FROM productos";
            $registros = array('data' => array());
            $res = $cx->query($sql);
            if ($res->num_rows > 0) {
                while ($row = $res->fetch_array()) {
                    $registros['data'][] = array($row[0], $row[1], $row[2], $row[3]);
                }
            }
            echo json_encode($registros);
            break;

        case "select":
            $idp = $_POST['idp'];
            $sql = "SELECT * FROM productos WHERE id_p=$idp";
            $res = $cx->query($sql);
            $row = $res->fetch_array();

            $valido['success'] = true;
            $valido['mensaje'] = "SE ENCONTRÓ PRODUCTO";
            $valido['id_p'] = $row[0];
            $valido['producto'] = $row[1];
            $valido['cantidad'] = $row[2];
            $valido['imagen'] = $row[3];

            echo json_encode($valido);
            break;

        case "update":
            $id_p = $_POST['idp'];
            $a = $_POST['producto'];
            $e = $_POST['cantidad'];
            $uploadDirectory = '../img_productos/';

            if (isset($_FILES['img1']) && $_FILES['img1']['error'] === UPLOAD_ERR_OK) {
                $fileTmpName = $_FILES['img1']['tmp_name'];
                $fileName = $_FILES['img1']['name'];
                $filePath = $uploadDirectory . basename($fileName);
                $fileNameOnly = basename($fileName);

                if (!is_dir($uploadDirectory)) {
                    mkdir($uploadDirectory, 0755, true);
                }

                if (move_uploaded_file($fileTmpName, $filePath)) {
                    $sql = "UPDATE productos SET producto='$a', cantidad='$e', imagen='$fileNameOnly' WHERE id_p=$id_p";
                } else {
                    $valido['success'] = false;
                    $valido['mensaje'] = "ERROR AL ACTUALIZAR IMAGEN";
                    echo json_encode($valido);
                    break;
                }
            } else {
                $sql = "UPDATE productos SET producto='$a', cantidad='$e' WHERE id_p=$id_p";
            }

            if ($cx->query($sql)) {
                $valido['success'] = true;
                $valido['mensaje'] = "SE ACTUALIZÓ CORRECTAMENTE EL PRODUCTO";
            } else {
                $valido['success'] = false;
                $valido['mensaje'] = "ERROR AL ACTUALIZAR EN BD: " . $cx->error;
            }

            echo json_encode($valido);
            break;

        case "delete":
            $idp = $_POST['idp'];
            $sql_prendas = "DELETE FROM productos WHERE id_p = $idp";
            if ($cx->query($sql_prendas)) {
                $valido['success'] = true;
                $valido['mensaje'] = "SE ELIMINÓ CORRECTAMENTE";
            } else {
                $valido['success'] = false;
                $valido['mensaje'] = "ERROR AL ELIMINAR EN BD (TABLA PRENDAS)";
            }
            echo json_encode($valido);
            break;

        default:
            echo json_encode(["error" => "Acción no válida"]);
            break;
    }
} else {
    echo json_encode(["error" => "Método no permitido"]);
}
?>
