// Funções padrões para a janelas
import {
  API_ROUPAS,
  API_CLIENT_KEY,
  fetchAuth,
  logoutUser,
  getUserId,
  exibirNomeFront,
  redirecionar,
  verQuantidadeCart
} from "./services/config.js";

// função que vê quantos itens o usuario tem no carrinho
verQuantidadeCart();
// Exibe o nome do usuario em seu icone
exibirNomeFront();
const btnLogout = document.getElementById("logout-btn");
btnLogout.addEventListener("click", logoutUser);

// Área para pegar elementos do html
const cartNun = document.getElementById("carrinho");
const lista_produtos_shift = document.getElementById("lista-produtos");

// eventos de click
cartNun.addEventListener("click", () => {
  if (!getUserId()) {
    alert("Loge para entrar no carrinho");
    redirecionar();
  } else {
    window.location.href = "../view/cart.html";
  }
});

// função que carrega os produtos na tela
async function carregarProdutos() {
  try {
    const limit = 10;
    mostrarSkeleton(limit);
    const res = await fetchAuth(
      `${API_ROUPAS}/genero/?limit=${limit}&offset=${0}`,
      {
        headers: {
          "shift-api-key": API_CLIENT_KEY,
        },
      },
    );
    const dados = await res.json();

    if (!res.ok) {
      throw new Error(dados.message || "Erro ao carregar produtos");
    }
    lista_produtos_shift.innerHTML = "";
    cardProdutos(dados);
  } catch (err) {
    console.error(err.message);
  }
}

// função que constroi o card dos produtos
function cardProdutos(dados) {
  dados.data.forEach((roupa) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
  <a href="produto_uni.html?id=${roupa.id}&tamanho=${roupa.tamanho}&cor=${
      roupa.cor
    }"<div class="card-img">
    <img src="http://localhost:3000/uploads/${roupa.img}" alt="${roupa.nome}">
  </div>
  <div class="card-info">
    <h2 class="card-title">${roupa.nome} ${roupa.tamanho}</h2>
    <p class="card-color">Cor: ${roupa.cor} ${roupa.categoria}</p>
    <p class="card-price">R$ ${Number(roupa.preco).toFixed(2)}</p>
  </div>
  <div class = "btn-add-cart"><button class="addToCart">Comprar</button></div>
  </a>
`;
    lista_produtos_shift.appendChild(card);
  });
}

// função que mostra um "eskeleto" para o usuario para que ele não ache que o site não está funcionando
function mostrarSkeleton(qtd = 4) {
  lista_produtos_shift.innerHTML = "";

  for (let i = 0; i < qtd; i++) {
    const skeleton = document.createElement("div");
    skeleton.classList.add("card", "skeleton");

    skeleton.innerHTML = `
      <div class="card-img"></div>
      <div class="card-info">
        <div class="skeleton-text title"></div>
        <div class="skeleton-text small"></div>
        <div class="skeleton-text price"></div>
        <div class="skeleton-btn"></div>
      </div>
    `;

    lista_produtos_shift.appendChild(skeleton);
  }
}


carregarProdutos();
