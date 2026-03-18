import {API_ROUPAS, API_CLIENT_KEY, getUserFromToken, fetchAuth, exibirNome} from "../script/services/config.js"
 //nome do client
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

    img.src = `http://localhost:3000/uploads/${dados.data.img}`;
    img.alt = `${dados.data.nome}`;
    nome.textContent = dados.data.nome;
    code.textContent = `Codigo do produto: ${dados.data.id}`;
    let preco_unit = preco.textContent = `R$ ${dados.data.preco}`
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
    })
    select.addEventListener("change", () =>{
        select.value;
        selectCor.value;
        console.log(select.value, selectCor.value);

    })
    }catch(err){
       return alert(err.message);
    }

}
async function atualizaProduto(){
    //aqui dentro vai atualizar o produto quanto o usuario escolher outro tamanho ou cor
} 

await exibirProduto();