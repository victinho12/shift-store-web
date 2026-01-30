import { API_ROUPAS, API_CLIENT_KEY, API_LOGIN, validarTokenFront, fetchAuth } from "../../script/services/config.js";

validarTokenFront();

const cards = document.getElementById("cards");
const cardsOriginaisHTML = cards.innerHTML;
const btnVoltarSite = document.getElementById('btn-voltar-site');

btnVoltarSite.addEventListener('click', () =>{
  window.location.href = '../view/home.html';
})


async function carregarProdutosAdm() {
  try {
    mostrarSkeleton(4);
    const res = await fetchAuth(`${API_ROUPAS}count`, {
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
    });
    const resUser = await fetchAuth(`${API_LOGIN}/count`,{
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      }
    })
    if (!res.ok) throw new Error("Erro ao buscar produtos" + res.msg);
    if (!resUser.ok) throw new Error("Erro ao buscar usuários" + res.msg);

    const dados_user = await resUser.json();
    const dados = await res.json();
    document.querySelectorAll(".skeleton").forEach((card) => card.remove());
    cards.innerHTML = cardsOriginaisHTML;
    const qtdProdutos = document.getElementById("qtd-produtos");
    const qtdUsers = document.getElementById('qtd-usuarios');
    qtdUsers.textContent = dados_user.total_user;
    qtdProdutos.textContent = dados.total;
    
  } catch (err) {
    console.error(err.message);
  }
}

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
