// ========== dados da api ==========
import { API_ROUPAS, API_CLIENT_KEY, fetchAuth, logoutUser } from "./services/config.js";
let limit = 20;
let offset = 0;
let couter = 0;
let timeout;
let carregando = false;
// ========== Pagando id do html ==========
const nome = document.getElementById("nome_cliente");
const cartNun = document.getElementById("carrinho")
const lista_produtos_shift = document.getElementById("lista-produtos");
const btnLogout = document.getElementById("logout-btn");
const btnFiltro = document.getElementById("btn-filtrar");
const btnMasc = document.getElementById("btn-genero-masc");
const btnFeme = document.getElementById("btn-genero-feme");
// ========== pegando valores do localstorage ==========
const nome_value = localStorage.getItem("nome");

if (nome_value) {
  nome.textContent = nome_value;
  nome.style.display = "block";
} else {
  nome.textContent = "user";
  nome.style.display = "block";
}
// ========== Elementos de click ==========
btnLogout.addEventListener("click", logoutUser);

btnFiltro.addEventListener("click", () => {
  document.querySelector(".filtro-genero")
    .classList.toggle("ativo");
});
btnFiltro.addEventListener("click", () => {
  const isHidden = getComputedStyle(btnMasc).display === "none";

  btnMasc.style.display = isHidden ? "block" : "none";
  btnFeme.style.display = isHidden ? "block" : "none";

  clearTimeout(timeout);
  timeout = setTimeout(() => {
    lista_produtos_shift.innerHTML = "";
    carregarProdutos();
  }, 300);
});

btnMasc.addEventListener("click", () => {
  lista_produtos_shift.innerHTML = "";
  carregarProdutos("masculino");
});
btnFeme.addEventListener("click", () => {
  lista_produtos_shift.innerHTML = "";
  carregarProdutos("feminino");
});

async function carregarProdutos(genero) {
  try {
    if(carregando) return
    if (!genero) {
      genero = "";
    }
     mostrarSkeleton(limit);
    const res = await fetchAuth(
      `${API_ROUPAS}genero?limit=${limit}&offset=${offset}&categoria_nome=${genero}`,
      {
        headers: {
          "shift-api-key": API_CLIENT_KEY,
        },
      },
    );

    if (!res.ok) {
      const erroText = await res.text();
      throw new Error(erroText);
    }

    const resJson = await res.json();
    if (!Array.isArray(resJson)) {
      console.error("Resposta inesperada", resJson);
      return;
    }
     lista_produtos_shift.innerHTML = ""; // remove skeleton

    resJson.forEach((roupa) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
  <a href="produto_uni.html?id=${roupa.id}" class="card-link"> <div class="card">
  <div class="card-img">
    <img
      src="http://localhost:3000/uploads/${roupa.img}"
      alt="${roupa.nome_roupa}"
    />
  </div>

  <div class="card-info">
    <h2 class="card-title">${roupa.nome_roupa}</h2>
    <span class="card-category">${roupa.cate_nome}</span>

    <p class="card-color">Cor: ${roupa.cor}</p>

    <p class="card-price">
      R$ <strong>${Number(roupa.preco).toFixed(2)}</strong>
    </p>
    </a>

  </div>
</div>

`;
      lista_produtos_shift.appendChild(card);
    });
  } catch (err) {
    console.error(err.message, "kk");
    alert(err.message);
  } finally {
    carregando = false
  }
}
function couterCarrinhoFunc() {
  couterCarrinho = couterCarrinho + 1;
  const carrinho = (document.getElementById("carrinho").textContent =
    couterCarrinho);
}

function mostrarSkeleton(qtd = 20) {
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
function atualizaCart() {
  couter = parseInt(localStorage.getItem("couterCar")) || 0;
  cartNun.textContent = couter;
}

carregarProdutos();
atualizaCart()