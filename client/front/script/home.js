import {
  API_ROUPAS,
  API_CLIENT_KEY,
  fetchAuth,
  logoutUser,
} from "./services/config.js";

let limit = 5;
let offset = 0;
let couter = 0;

const imgs = document.getElementById("img");
const img = document.querySelectorAll("#img img");
const cartNun = document.getElementById("carrinho");
const lista_produtos_shift = document.getElementById("lista-produtos");
const nome = document.getElementById("nome_cliente");
const nome_value = localStorage.getItem("nome");
const btnLogout = document.getElementById("logout-btn");

btnLogout.addEventListener("click", logoutUser);

if (nome_value) {
  nome.textContent = nome_value;
  nome.style.display = "block";
} else {
  nome.textContent = "user";
  nome.style.display = "block";
}

let idx = 0;
function carrocel() {
  idx++;
  if (idx > img.length - 1) {
    idx = 0;
  }
  imgs.style.transform = `translateX(${-idx * 100}%)`;
}
setInterval(carrocel, 3000);

async function carregarProdutos() {
  try {
    mostrarSkeleton(5);
    const res = await fetchAuth(
      `${API_ROUPAS}genero/?limit=${limit}&offset=${offset}`,
      {
        headers: {
          "shift-api-key": API_CLIENT_KEY,
        },
      },
    );
    const resJson = await res.json();

    if (!res.ok) {
      throw new Error(resJson.message || "Erro ao carregar produtos");
    }
    if (resJson.ok === false) {
      throw new Error(resJson.message || "Erro ao carregar produtos");
    }
    lista_produtos_shift.innerHTML = "";

    resJson.data.forEach((roupa) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
      <a href="produto_uni.html?id=${roupa.id}" class="card-link">
  <div class="card-img">
    <img src="http://localhost:3000/uploads/${roupa.img}" alt="${roupa.nome}">
  </div>
  <div class="card-info">
    <h2 class="card-title">${roupa.nome} ${roupa.tamanho}</h2>
    <p class="card-color">Cor: ${roupa.cor}</p>
    <p class="card-price">R$ ${Number(roupa.preco).toFixed(2)}</p>
  </div>
  </a>
`;
      lista_produtos_shift.appendChild(card);
    });
  } catch (err) {
    console.error(err.message);
    alert(err.message);
  }
}

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
function atualizaCart() {
  couter = parseInt(localStorage.getItem("couterCar")) || 0;
  cartNun.textContent = couter;
}

carregarProdutos();
atualizaCart();
