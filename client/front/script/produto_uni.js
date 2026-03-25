import {API_ROUPAS, API_CLIENT_KEY, getUserFromToken, fetchAuth, exibirNome} from "../script/services/config.js"
import { addToCart } from "./cart.js";
 //nome do client
 let id_usuario = getUserFromToken();
 if(!id_usuario) alert("crie uma conta");
document.getElementById("nome_cliente").textContent = exibirNome();
let img = document.getElementById("produto_img");
let nome = document.getElementById("proudto_title");
let code = document.getElementById("produto_code");
let preco = document.getElementById("produto_preco");
let parcela = document.getElementById("produto_preco_parcela");
let select = document.getElementById("produto_tamanho");
let selectCor = document.getElementById("produto_cor");

const queryString = window.location.search;
const url_params = new URLSearchParams(queryString);
let id = url_params.get("id");


let btn_add_ao_carrinho = document.getElementById("btn-comprar");
btn_add_ao_carrinho.addEventListener("click", async () =>{
    await addToCart(id_usuario, id, 4);
    if(addToCart){
        window.location.href = "../view/cart.html";
    }
})


let tamanhoP;
let corP; 

async function exibirProduto() {
    try{
        tamanhoP = url_params.get("tamanhoP")
        corP = url_params.get("corP");
    const res = await fetchAuth(`${API_ROUPAS}${id}/?tamanhoP=${tamanhoP}&corP=${corP}`,{
        headers: {
            "shift-api-key": API_CLIENT_KEY
        }
    });
    const dados = await res.json();
    if(!dados.ok) return alert(dados);
    console.log(dados);
    img.src = `http://localhost:3000/uploads/${dados.data.img}`;
    img.alt = `${dados.data.nome}`;
    nome.textContent = dados.data.nome;
    code.textContent = `Codigo do produto: ${dados.data.id}`;
    const valor_parcela = dados.data.preco/7;
    parcela.textContent = `7x de R$ ${valor_parcela.toFixed(2)}`

    dados.tamanhos.forEach((item) => {
        const option = document.createElement("option");
        option.textContent = item.tamanho
        option.value = item.tamanho
        select.appendChild(option);

    });
    dados.cores.forEach((item) => {
        const option = document.createElement("option");
        option.textContent = item.cor
        option.value = item.cor
        selectCor.appendChild(option);
    });
    const qtd = dados.data.estoque_qtd;
    console.log(qtd);

    select.addEventListener("change", () =>{select.value;  });
    selectCor.addEventListener("change", () =>{selectCor.value; });
    }catch(err){
       return alert(err.message);
    }

}




await exibirProduto();