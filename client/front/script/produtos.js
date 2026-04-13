// Funções padrões para a janelas
import {
  API_ROUPAS,
  API_CLIENT_KEY,
  fetchAuth,
  logoutUser,
  loading,
  getUserId,
  exibirNomeFront,
  verQuantidadeCart,
} from "./services/config.js";
// Exibe o nome do usuario em seu icone
exibirNomeFront();
verQuantidadeCart();
loading();
const btnLogout = document.getElementById("logout-btn");
btnLogout.addEventListener("click", logoutUser);

// Área para pegar elementos do html
const lista_produtos_shift = document.getElementById("lista-produtos");
const btnFiltro = document.getElementById("btn-filtrar");
const btnMasc = document.getElementById("btn-genero-masc");
const btnFeme = document.getElementById("btn-genero-feme");
const divLoad = document.getElementById("divLoad");

// eventos de click
btnFiltro.addEventListener("click", () => {
  loading();
  const filtro = document.querySelector(".filtro-genero");

  // alterna classe (abrir/fechar)
  filtro.classList.toggle("ativo");

  // verifica se está visível
  const isHidden = getComputedStyle(btnMasc).display === "none";

  // mostra ou esconde botões
  btnMasc.style.display = isHidden ? "block" : "none";
  btnFeme.style.display = isHidden ? "block" : "none";

  // recarrega produtos
  lista_produtos_shift.innerHTML = "";
  carregarProdutos();
});
btnMasc.addEventListener("click", () => {
  loading();
  lista_produtos_shift.innerHTML = "";
  carregarProdutos("masculino");
});
btnFeme.addEventListener("click", () => {
  loading();
  lista_produtos_shift.innerHTML = "";
  carregarProdutos("feminino");
});

// função que carrega os produtos na tela
async function carregarProdutos(genero) {
  try {
    const limit = 20;
    if (!genero) {
      genero = "";
    }
    mostrarSkeleton(limit);
    const res = await fetchAuth(
      `${API_ROUPAS}/genero?limit=${limit}&offset=${0}&categoria_nome=${genero}`,
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

    lista_produtos_shift.innerHTML = ""; // remove skeleton
    divLoad.innerHTML = ""; // remove a tela de carregamento
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
          <a href="produto_uni.html?id=${
            roupa.id
          }" class="card-link"> <div class="card">
          <div class="card-img">
            <img
              src="http://localhost:3000/uploads/${roupa.img}"
              alt="${roupa.nome}"
            />
          </div>

          <div class="card-info">
            <h2 class="card-title">${roupa.nome}</h2>
            <span class="card-category">${roupa.categoria}</span>

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
}

// função que mostra um "eskeleto" para o usuario para que ele não ache que o site não está funcionando
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

carregarProdutos();
