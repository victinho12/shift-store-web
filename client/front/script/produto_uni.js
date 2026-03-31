import {
  API_ROUPAS,
  API_CLIENT_KEY,
  getUserFromToken,
  fetchAuth,
  exibirNome,
  loading,
} from "../script/services/config.js";
import { addToCart, carregarCart } from "./cart.js";
//nome do client
let id_usuario = getUserFromToken();
if (!id_usuario) alert("crie uma conta");
document.getElementById("nome_cliente").textContent = exibirNome();
let img = document.getElementById("produto_img");
let nome = document.getElementById("proudto_title");
let code = document.getElementById("produto_code");
let preco = document.getElementById("produto_preco");
let parcela = document.getElementById("produto_preco_parcela");
let select = document.getElementById("produto_tamanho");
let selectCor = document.getElementById("produto_cor");
let divLoading = document.getElementById("divLoad");
let categoira;

let idVariacao = null;
select.value || "";
selectCor.value || "";
const queryString = window.location.search;
const url_params = new URLSearchParams(queryString);
let id = url_params.get("id");

let btn_add_ao_carrinho = document.getElementById("btn-comprar");
btn_add_ao_carrinho.addEventListener("click", async () => {
  // e aqui ele recebe o que veio das selecões que o user fez
  try {
    loading();
    if (!idVariacao) {
      alert("Selecione cor e tamanho");
      divLoading.innerHTML = "";
      return;
    }
    const sucesso = await addToCart(id_usuario, idVariacao, 1);
    console.log(sucesso);
    if (!sucesso) {
      alert("Não foi possivel adicionar ao carrinho");
      divLoading.innerHTML = "";
    } else {
      window.location.href = "../view/cart.html";
    }
  } catch (err) {
    console.log(err.message);
  }
});

let tamanhoP;
let corP;

async function exibirProduto() {
  try {
    loading();
    tamanhoP = url_params.get("tamanhoP");
    corP = url_params.get("corP");
    const res = await fetchAuth(`${API_ROUPAS}${id}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    });
    const dados = await res.json();
    if (!res.ok) return alert(dados);

    console.log(dados);
    // colocando dados no html
    divLoading.innerHTML = "";
    img.src = `http://localhost:3000/uploads/${dados.data.img}`;
    img.alt = `${dados.data.nome}`;
    nome.textContent = dados.data.nome;
    code.textContent = `Codigo do produto: ${dados.data.id}`;
    const valor_parcela = dados.data.preco / 7;
    parcela.textContent = `7x de R$ ${valor_parcela.toFixed(2)}`;
    preco.textContent = `R$ ${dados.data.preco}`;
    categoira = dados.data.id_categoria;
    //forEecht paara ver os tamanhos
    dados.tamanhos.forEach((item) => {
      const option = document.createElement("option");
      option.textContent = item.tamanho; // o usuário vê
      option.value = item.id_tamanho; // o sistema usa
      select.appendChild(option);
    });

    dados.cores.forEach((item) => {
      const option = document.createElement("option");
      option.textContent = item.cor;
      option.value = item.id_cor;
      selectCor.appendChild(option);
    });
    const qtd = dados.data.estoque_qtd;
    console.log(qtd);
    /// atualizando os selects
    select.addEventListener("change", async () => {
      try {
        const tamanho = select.value;
        const corSelecionada = selectCor.value;
        const dados = await buscarProduto(tamanho, corSelecionada, categoira);

        idVariacao = dados.data.id; // 👈 GUARDA AQUI
        console.log(idVariacao);
        atualizarDados(dados);
      } catch (err) {
        alert(err.message);
      }
    });
    selectCor.addEventListener("change", async () => {
      try {
        const tamanho = select.value;
        const corSelecionada = selectCor.value;
        const dados = await buscarProduto(tamanho, corSelecionada, categoira);

        idVariacao = dados.data.id; // 👈 GUARDA AQUI
        console.log(idVariacao);
        atualizarDados(dados);
      } catch (err) {
        alert(err.message);
      }
    });
  } catch (err) {
    return alert(err.message);
  }
}

async function buscarProduto(tamanhoP, corP, categoira) {
  //aqui dentro desse fatch ele vai se conectar com a query que retorna o id, mas aqui ela tem que ter mais um campo, que é categoria/genero, sugestão, ele
  // pode manda direto pela url que fica mais facil
  loading();
  const res = await fetchAuth(
    `${API_ROUPAS}mandarCart/?tamanho=${tamanhoP}&cor=${corP}&categoria=${categoira}`,
    {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    },
  );

  const dados = await res.json();
  divLoading.innerHTML = "";
  if (!res.ok) throw new Error("Erro ao buscar produto " + dados.message);
  return dados;
}
async function atualizarDados(dados) {
  //aqui ta tudo certo
  const { data } = dados;
  img.src = `http://localhost:3000/uploads/${data.img}`;
  img.alt = `${data.nome}`;
  nome.textContent = data.produto_nome;
  code.textContent = `Codigo do produto: ${data.id}`;
  const valor_parcela = data.preco / 7;
  parcela.textContent = `7x de R$ ${valor_parcela.toFixed(2)}`;
}

await exibirProduto();
