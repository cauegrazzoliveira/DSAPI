<?php
    $valor = $_GET["valor"];
    $txt = "";
    for($i = 1; $i <= $valor ; $i++){
        $txt .= $i."<br>";
    }

    echo $txt;






?>