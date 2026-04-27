import {
  API_ROUPAS,
  API_CLIENT_KEY,
  fetchAuth,
  exibirNomeFront,
  loading,
  getUserId,
} from "../script/services/config.js";
import { addToCart } from "./cart.js";
exibirNomeFront();
let img = document.getElementById("produto_img");
let nome = document.getElementById("produto_title");
let code = document.getElementById("produto_code");
let preco = document.getElementById("produto_preco");
let parcela = document.getElementById("produto_preco_parcela");
let selectTamanho = document.getElementById("produto_tamanho");
let selectCor = document.getElementById("produto_cor");

let id_familia;

loading(true);
const produtoState = {
  categoria: null,
  idVariacao: null,
};

function getIdProduto() {
  const queryString = window.location.search;
  const url_params = new URLSearchParams(queryString);
  let id = Number(url_params.get("id"));
  return id;
}


let btn_add_ao_carrinho = document.getElementById("btn-comprar");
btn_add_ao_carrinho.addEventListener("click", async () => {
  // e aqui ele recebe o que veio das selecões que o user fez
  try {
    
    if (!produtoState.idVariacao) {
      alert("Selecione uma cor e tamanho"); return; 
    }
    loading(true);
    const sucesso = await addToCart(getUserId(), produtoState.idVariacao, 1);
    console.log(sucesso);
    if (!sucesso) {
      alert("Não foi possivel adicionar ao carrinho");
     
    } else {
      window.location.href = "../view/cart.html";
    }
  } catch (err) {
    console.log(err.message);
  }finally{
    loading(false)
  }
});

async function exibirProduto() {
  try {
    loading(true);
    const res = await fetchAuth(`${API_ROUPAS}/${getIdProduto()}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    });
    const dados = await res.json();
    if (!res.ok) throw new Error(dados.message);
    // colocando dados no html
    id_familia = dados.data.id_familia;
    img.src = `http://localhost:3000/uploads/${dados.data.img}`;
    img.alt = `${dados.data.nome}`;
    nome.textContent = dados.data.nome;
    code.textContent = `Codigo do produto: ${dados.data.id}`;
    const valor_parcela = dados.data.preco / 7;
    parcela.textContent = `7x de R$ ${valor_parcela.toFixed(2)}`;
    preco.textContent = `R$ ${dados.data.preco}`;
    produtoState.categoria = dados.data.id_categoria;
    //forEecht paara ver os tamanhos
    selectTamanho.innerHTML = `<option value="" disabled selected>Selecione o tamanho</option>`;
    
    dados.tamanhos.forEach((item) => {
      const option = document.createElement("option");
      option.textContent = item.tamanho; // o usuário vê
      option.value = item.id_tamanho; // o sistema usa
      selectTamanho.appendChild(option);
    });
    selectCor.innerHTML = `<option value="" disabled selected>Selecione a cor</option>`;
    dados.cores.forEach((item) => {
      const option = document.createElement("option");
      option.textContent = item.cor;
      option.value = item.id_cor;
      selectCor.appendChild(option);
    });
    const quantidade = dados.data.estoque_qtd;
    console.log(quantidade);

    /// atualizando os selects
    selectTamanho.addEventListener("change", changeSelect);
    selectCor.addEventListener("change", changeSelect);
  } catch (err) {
    return alert(err.message);
  } finally{
    loading(false);
  }
}

async function buscarProduto(tamanho, cor, categoria, id_familia) {
  try {
    loading(true);

    const res = await fetchAuth(
      `${API_ROUPAS}/mandarCart/?tamanho=${tamanho}&cor=${cor}&categoria=${categoria}&id_familia=${id_familia}`,
      {
        headers: {
          "shift-api-key": API_CLIENT_KEY,
        },
      },
    );

    const dados = await res.json();

    if (!res.ok) throw new Error(dados.message || "Erro na requisição");

    return dados;
  } finally {
    loading(false);
  }
}
async function atualizarDados(dados) {
  //aqui ta tudo certo
  const { data } = dados;
  img.src = `https://shift-store-web.onrender.com/uploads/${data.img}`;
  img.alt = `${data.nome}`;
  nome.textContent = data.nome;
  code.textContent = `Codigo do produto: ${data.id}`;
  const valor_parcela = data.preco / 7;
  parcela.textContent = `7x de R$ ${valor_parcela.toFixed(2)}`;
}

async function changeSelect() {
  try{
    
    const tamanho = selectTamanho.value;
    const cor = selectCor.value;
     
    console.log(id_familia);
    if(!tamanho || !cor) return;
    const dados = await buscarProduto(tamanho, cor, produtoState.categoria, id_familia);
    produtoState.idVariacao = dados.data.id;
    atualizarDados(dados); 
  }catch(err){
    return alert(err.message);
  }
}

await exibirProduto();
