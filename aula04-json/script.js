function lerJSON(){
    var req = new XMLHttpRequest();

    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){

            var objJSON = JSON.parse(this.responseText);
            let txt = "Modelo: " + objJSON.modelo;
            txt += "<br>Ano: " + objJSON.ano;

            // Correção na lógica do Câmbio Automático
            txt += "<br>Câmbio Automático: ";
            if (objJSON.cambioAutomatico) 
                txt += "Sim";
            else    
                txt += "Não";

            // Manipulação correta do array combustivel
            txt += "<br>Combustíveis: " + objJSON.combustivel.join(' - ');

            txt += "<br>Proprietário: " + objJSON.proprietario.nome;

            txt += "<br>Opcionais: ";
            // Correção do erro de digitação em 'opcionais' e manipulação do array corretamente
            objJSON.opcionais.forEach(op => {
                txt += "<br>" + op.nome + " Marca: " + op.marca;
            });

            // Definindo o conteúdo HTML da div
            document.getElementById("divJSON").innerHTML = txt;

        } else if(this.readyState == 4){
            alert(this.status + " - " + this.statusText);
        }
    };

    req.open("GET", "dados.json", true);
    req.send();
}


function consultar(){
    var req = new XMLHttpRequest();

    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var objJSON = JSON.parse(this.responseText);
            if(objJSON.resposta){
                alert(objJSON.resposta);
            }else{
                txt = '<table border="1">';
                txt += '    <tr>';
                txt += '        <th>ID</th>';
                txt += '        <th>Nome</th>';
                txt += '        <th>Preço</th>';
                txt += '        <th>Excluir</th>';
                txt += '    </tr>';
                objJSON.produtos.forEach(prod => {
                    txt += '<tr>';
                    txt += '    <td>' + prod.id + '</td>';
                    txt += '    <td>' + prod.nome + '</td>';
                    txt += '    <td>' + prod.preco + '</td>';
                    txt += '    <td>' + '<button onclick="excluir('+prod.id+')">X</button>' + '</td>';
                    txt += '</tr>';
                });
                txt += '</table>';
                document.getElementById("divProdutos").innerHTML = txt; 
            }
            
        }else if(this.readyState == 4){
            alert(this.status + " - " + this.statusText);
        }
    };

    req.open("GET", "servidor.php?consultar", true);
    req.send()
}

function salvar(){
    var nome = document.getElementById("txtNome").value;
    if (nome == "") alert("O campo NOME é obrigatório!");
    else{
        var preco = document.getElementById("txtPreco").value;
        vPreco = 0.0
        if(preco != ""){
            preco = preco.replace("," , ".");
            vPreco = parseFloat(preco);
        }

        var req = new XMLHttpRequest();

        req.onreadystatechange = function(){
            if(this.readyState == 4 && this.status == 200){
                var objJSON = JSON.parse(this.responseText);
                if(objJSON.resposta){
                    alert(objJSON.resposta);
                }else{
                    alert("Id gerado: " + objJSON.id)
                    consultar();
                }
            }else if(this.readyState == 4){
                alert(this.status + " - " + this.statusText);
            }
        };
    
        req.open("POST", "servidor.php?inserir", true);
        req.setRequestHeader("Content-type",
                        "application/x-www-form-urlencoded");
        req.send("name=" + nome + "&price=" + vPreco);
    }
}

function excluir(id){
    var req = new XMLHttpRequest();

    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var objJSON = JSON.parse(this.responseText);
            if(objJSON.resposta){
                alert(objJSON.resposta);
                consultar();
            }
        }else if(this.readyState == 4){
            alert(this.status + " - " + this.statusText);
        }
    };

    req.open("GET", "servidor.php?deletar&idProduto=" + id, true);
    req.send();
}
