<?php
require_once "bd.php";
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('America/Mexico_City');

$valido['success'] = array('success' => false, 'mensaje' => '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    switch ($action) {
        case "selectInfo":
            $sql = "SELECT * FROM info";
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
                $idp = $_POST['idi'];
                $sql = "SELECT * FROM info WHERE id_i=$idp";
                $res = $cx->query($sql);
                $row = $res->fetch_array();
    
                $valido['success'] = true;
                $valido['mensaje'] = "SE ENCONTRÓ INFORMACION";
                $valido['id_i'] = $row[0];
                $valido['horario'] = $row[1];
                $valido['telefono'] = $row[2];
                $valido['ubicacion'] = $row[3];
    
                echo json_encode($valido);
                break;

                case "update":
                    $id_p = $_POST['idp'];
                    $horario = $_POST['horario'];
                    $telefono = $_POST['telefono'];
                    $direccion = $_POST['direccion'];
                
                    $sql = "UPDATE info SET horario='$horario', telefono='$telefono', ubicacion='$direccion' WHERE id_i=$id_p";
                    if ($cx->query($sql)) {
                        $valido['success'] = true;
                        $valido['mensaje'] = "SE ACTUALIZÓ CORRECTAMENTE LA INFORMACIÓN";
                    } else {
                        $valido['success'] = false;
                        $valido['mensaje'] = "ERROR AL ACTUALIZAR EN BD: " . $cx->error;
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
