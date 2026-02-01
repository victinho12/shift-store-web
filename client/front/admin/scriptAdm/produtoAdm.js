import {
  validarTokenFront,
  fetchAuth,
  API_CLIENT_KEY,
  API_ROUPAS,
} from "../../script/services/config.js";
validarTokenFront();
const btnFecharModalAddProdutos = document.getElementById(
  "btn-fechar-add-produto",
);
const ModalInserirRoupas = document.getElementById("add-produtos");
const btnMoldalAddProduto = document.getElementById("btn-card");
const listaProdutos = document.getElementById("lista-produtos");
const btnInserirRoupa = document.getElementById("btn-inserir-roupa");
const form = document.getElementById("form-produto");
const pesquisarProduto = document.getElementById("pesquisar-produto");
const btnPesquisarProduto = document.getElementById("btn-pesquisar");

btnPesquisarProduto.addEventListener;
btnInserirRoupa.addEventListener("click", async () => {
  const formData = new FormData(form);
  const succeso = await inserirRoupa(formData);
  if (succeso) {
    console.log("alkdjlf");
  }
});
btnMoldalAddProduto.addEventListener("click", () => {
  ModalInserirRoupas.style.display = "block";
});

btnFecharModalAddProdutos.addEventListener("click", () => {
  ModalInserirRoupas.style.display = "none";
});

async function carregarProdutos() {
  try {
    const res = await fetchAuth(`${API_ROUPAS}genero`, {
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
    });
    const dados = await res.json();
    listaProdutos.innerHTML = " ";
    dados.forEach((roupa) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
  <div class="card-img">
    <img
      src="http://localhost:3000/uploads/${roupa.img}"
      alt="${roupa.nome}"
    />
  </div>

  <div class="card-info">
  
    <h2 class="card-title">${roupa.nome}</h2>
    <p class="card-color">Familia: ${roupa.id_familia}</p>
    <p class="card-color">Id: ${roupa.id}</p>
    <span class="card-category">${roupa.categoria}</span>

    <p class="card-color">Cor: ${roupa.cor}</p>

    <p class="card-price">
      R$ <strong>${Number(roupa.preco).toFixed(2)}</strong>
    </p>
  </div>

  <div class="card-actions">
    <button class="btn-editar-roupa" data-id="${roupa.id}">
      Editar
    </button>
    <button class="btn-excluir-roupa" data-id="${roupa.id}">
      Excluir
    </button>
  </div>
    `;
      card
        .querySelector(".btn-excluir-roupa")
        .addEventListener("click", async () => {
          excluirRoupa(roupa.id);
          carregarProdutos();
        });
      card
        .querySelector(".btn-editar-roupa")
        .addEventListener("click", async () => {
          console.log("editando");
        });
      listaProdutos.appendChild(card);
    });
  } catch (err) {
    console.log("erro do servidor", err.message);
  }
}

async function excluirRoupa(id) {
  try {
    const res = await fetchAuth(`${API_ROUPAS}${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
    });

  } catch (err) {
    console.error(err.message);
  }
}

async function inserirRoupa(formData) {
  try {
    const res = await fetchAuth(`${API_ROUPAS}`, {
      method: "POST",
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
      body: formData,
    });
    const dados = await res.json();
    if (!res.ok) {
      console.error(dados);
      return false;
    }

    console.log(dados);
    return true;
  } catch (err) {
    console.error(err.message);
    return false;
  }
}
carregarProdutos();
