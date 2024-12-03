<?php
require_once "bd.php";
header('Content-Type: text/html; charset=utf-8');

if($_POST){
    $action=$_REQUEST['action'];

    switch($action){
        case "publicar":

            $valido['success']=array('success'=>false,'mensaje'=>"");            
            $opinion=$_POST['opinion'];
            $email=$_POST['email'];
           
            $check = "SELECT id FROM users WHERE email='$email'";
            $result = $cx->query($check);
            
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $id = $row['id'];
            
            
                $sql = "INSERT INTO opiniones (opinion, user_id) VALUES ('$opinion', '$id')";
                if ($cx->query($sql) === TRUE) {
                    $valido['success'] = true;
                    $valido['mensaje'] = "OPINIÓN PUBLICADA DE MANERA ÉXITOSA";
                } else {
                    $valido['success'] = false;
                    $valido['mensaje'] = "ERROR AL PUBLICAR OPINIÓN";
                }
            } else {
                $valido['success'] = false;
                $valido['mensaje'] = "USUARIO NO DISPONIBLE";
            }

        echo json_encode($valido);
        break;


        case "cargarOpiniones":
            $result = $cx->query("SELECT users.id, users.name, users.foto, opiniones.opinion, opiniones.fecha, opiniones.id_o
            FROM opiniones INNER JOIN users ON(users.id=opiniones.user_id) ORDER BY opiniones.fecha DESC");
            $rows = array();
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            echo json_encode($rows);
        break;
        

        case "selectOpinion":
            $id_o = $_POST['id_o'];
            $result = $cx->query("SELECT users.name, users.foto, opiniones.opinion, opiniones.id_o 
                                  FROM opiniones 
                                  INNER JOIN users ON users.id = opiniones.user_id 
                                  WHERE opiniones.id_o = '$id_o'");
        
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                echo json_encode($row);
            } else {
                echo json_encode(array('error' => 'No se encontró la opinión.'));
            }
            break;


            case "updateOpinion":
                $id_o = $_POST['ido'];
                $a = $_POST['corte'];
            
                    $sql = "UPDATE cortes SET corte='$a', precio='$e' WHERE id_c=$id_c";
                if ($cx->query($sql)) {
                    $valido['success'] = true;
                    $valido['mensaje'] = "SE ACTUALIZÓ CORRECTAMENTE EL CORTE";
                } else {
                    $valido['success'] = false;
                    $valido['mensaje'] = "ERROR AL ACTUALIZAR EN BD: " . $cx->error;
                }
    
                echo json_encode($valido);
                
            break;
        }
    
}else{
    $valido['success']=false;
    $valido['mensaje']="ERROR NO SE RECIBIÓ NADA";
}
?>