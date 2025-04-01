function lerDados(){
    var req = new XMLHttpRequest();

    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){

            var divDados = document.getElementById("divDados");
            divDados.innerHTML = this.responseText;

        }else if(this.readyState == 4){
            alert(this.status + " - " + this.statusText);
        }
    };

    req.open("GET", "infos.txt", true);
    req.send()
}
/////////////////////////////////////////////////////////////////
function lerNumeros(){
    var req = new XMLHttpRequest();

    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){

            var divNumeros = document.getElementById("divNumeros");
            divNumeros.innerHTML = this.responseText;

        }else if(this.readyState == 4){
            alert(this.status + " - " + this.statusText);
        }
    };

    var numero = document.getElementById("txtValor").value;

    req.open("GET", "servidor.php?valor=" + numero, true);
    req.send()
}

