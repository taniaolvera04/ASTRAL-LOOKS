<?php

$url = 'https://graph.facebook.com/v21.0/468305639708085/messages';
$token = 'EAAIqHhDwjaYBO58BxwcKdK7mYO6CvrHyflcDWUdEU4v51OxrZCoSZB61biuxgRt8WvcBXBUhYlDIrrgrE7n9YGx0aW4w8pcbf8pj6ctvjotXdGZANBMjX1XgT40zhlJ2wc70CMowQC1gMIUR81nX4TelDm9Jq1V7dHUacT5LWfZB3yyo6989mzR5Bc5ZBSMcHmwZDZD';

$nombre = "Carlos";
$fecha = "2024-12-06";

$data = array(
    "messaging_product" => "whatsapp",
    "recipient_type" => "individual",
    "to" => "525521726432",
    "type" => "template",
    "template" => array(
        "name" => "peluqueria",
        "language" => array(
            "code" => "es_MX"
        ),
        "components" => array(
            array(
                "type" => "body",
                "parameters" => array(
                    array(
                        "type" => "text",
                        "text" => $nombre
                    ),
                    array(
                        "type" => "text",
                        "text" => $fecha
                    )
                )
            )
        )
    )
);

$data_string = json_encode($data);

$curl = curl_init($url);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($curl, CURLOPT_POSTFIELDS, $data_string);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data_string))
);

$result = curl_exec($curl);
curl_close($curl);
echo $result;

?>
