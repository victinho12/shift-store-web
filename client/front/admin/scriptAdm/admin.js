import { API_ROUPAS, API_CLIENT_KEY, API_LOGIN, API_CHEKOUT, validarTokenFront, fetchAuth } from "../../script/services/config.js";

validarTokenFront();
const token = localStorage.getItem('token');
const user = JSON.parse(atob(token.split(".")[1]));
console.log(user.id);

const cards = document.getElementById("cards");
const cardsOriginaisHTML = cards.innerHTML;
const btnVoltarSite = document.getElementById('btn-voltar-site');

btnVoltarSite.addEventListener('click', () => {
  window.location.href = '../view/home.html';
})


async function carregarProdutosAdm() {
  try {
    mostrarSkeleton(4);
    const res = await fetchAuth(`${API_ROUPAS}/count`, {
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
    });
    const resUser = await fetchAuth(`${API_LOGIN}/count`, {
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      }
    });
    const resVendas = await fetchAuth(`${API_CHEKOUT}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY
      }
    });
    const dados_venda = await resVendas.json();
    const dados_user = await resUser.json();
    const dados = await res.json();

    if (!res.ok) throw new Error(dados.message);
    if (!resUser.ok) throw new Error(dados_user.message);
    if (!resVendas.ok) throw new Error(dados_venda.message);
 
    document.querySelectorAll(".skeleton").forEach((card) => card.remove());
    cards.innerHTML = cardsOriginaisHTML;
    const qtdProdutos = document.getElementById("qtd-produtos");
    const qtdUsers = document.getElementById('qtd-usuarios');
    const qtdVendas = document.getElementById("qtd-vendas");
    const faturamento = document.getElementById("faturamento");

    faturamento.textContent = `R$ ${dados_venda.faturamento.faturamento}`;
    qtdVendas.textContent = dados_venda.count.count;
    qtdUsers.textContent = dados_user.total_user;
    qtdProdutos.textContent = dados.data;
    console.log(dados.data);
  } catch (err) {
    alert(err.message);
    console.error(err.message);
  }
};

function mostrarSkeleton(qtd) {
  cards.innerHTML = "";

  for (let i = 0; i < qtd; i++) {
    const skeleton = document.createElement("div");
    skeleton.classList.add("card", "skeleton");

    skeleton.innerHTML = `
      <div class="card-info">
        <div class="skeleton-text title"></div>
        <div class="skeleton-text small"></div>
        <div class="skeleton-text price"></div>
      </div>
    `;

    cards.appendChild(skeleton);
  }
}

carregarProdutosAdm();
