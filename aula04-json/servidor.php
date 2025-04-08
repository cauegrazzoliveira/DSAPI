<?php
header("Content-type: application/json");

$local = "localhost";
$user = "root";
$senha = "";
$banco = "market";

if( isset($_REQUEST["consultar"])){
    try{
        $conn = mysqli_connect($local, $user, $senha, $banco);
        if($conn){
            $sql = "SELECT * FROM produto ORDER BY nome";
            $result = mysqli_query($conn, $sql);
            $linhas = array();
            while ($row = mysqli_fetch_assoc($result)) {
                $linhas[] = $row;
            }
            mysqli_close($conn);
            echo ' {"produtos" : ' . json_encode($linhas) .'} ';
        } else{
            echo ' {"resposta" : "Erro ao tentar conectar"} '; 
        }
    } catch(\Throwable $th){
        echo ' {"resposta" : "Erro no servidor"} '; 
    }
}

if(isset($_REQUEST["inserir"])){

    $nome = $_POST["name"];
    $preco = $_POST["price"];

    try{
        $conn = mysqli_connect($local, $user, $senha, $banco);
        if($conn){
            $sql = "INSERT INTO produto (nome, preco) VALUES ('$nome' , $preco) ";
            $result = mysqli_query($conn, $sql);
            $id = mysqli_insert_id($conn);
            mysqli_close($conn);
            echo ' { "id" : '.$id.'} ';
        } else{
            echo ' {"resposta" : "Erro ao tentar conectar"} '; 
        }
    } catch(\Throwable $th){
        echo ' {"resposta" : "Erro no servidor"} '; 
    }
    
}


if(isset($_REQUEST["deletar"])){

    $id = $_GET["idProduto"];

    try{
        $conn = mysqli_connect($local, $user, $senha, $banco);
        if($conn){
            $sql = "DELETE FROM produto WHERE id = $id";
            $result = mysqli_query($conn, $sql);
            $id = mysqli_insert_id($conn);
            mysqli_close($conn);
            echo ' { "resposta" : "Produto excluído com sucesso!"} ';
        } else{
            echo ' {"resposta" : "Erro ao tentar conectar"} '; 
        }
    } catch(\Throwable $th){
        echo ' {"resposta" : "Erro no servidor"} '; 
    }
    
}

?>