function lerJSON(){
    var req = new XMLHttpRequest();

    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){

            var objJSON = JSON.parse(this.responseText);
            txt = "Modelo: " + objJSON.modelo;
            txt += "<br>Ano: " + objJSON.ano;
            txt += "<br>Câmbio Automático: " + objJSON.ano;
            if (objJSON.cambioAutomatico) 
                txt += "Sim";
            else    
                txt += "Não";
            txt += "<br>Combustíveis: " + objJSON.ano;
            objJSON.combustivel.forEach( comb => {
                txt += comb + " - ";
            });
            txt += "<br>Proprietário: " + objJSON.proprietario.nome;
            txt += "<br>Opcionais: ";
            objJSON.opicionais.forEach( op =>{
                txt += "<br>" + op.nome + " Marca: " + op.marca;
            })           
            document.getElementById("divJSON").innerHTML = txt;

        }else if(this.readyState == 4){
            alert(this.status + " - " + this.statusText);
        }
    };

    req.open("GET", "dados.json", true);
    req.send()
}