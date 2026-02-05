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

form.addEventListener("submit", (e) => {
  e.preventDefault(); // impede submit/reload
});

btnInserirRoupa.addEventListener("click", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  await inserirRoupa(formData);
  carregarProdutos();
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
    dados.data.forEach((roupa) => {
      const card = document.createElement("div");
      card.classList.add("produtos-row");

      card.innerHTML = `
  <div class="produtos-img">
    <img src="http://localhost:3000/uploads/${roupa.img}" alt="${roupa.nome}" />
  </div>

  <div class="produtos-nome">
    <strong>${roupa.nome}</strong>
    <small>Tam: ${roupa.tamanho} • Família: ${roupa.id_familia} • ID: ${roupa.id}</small>
  </div>

  <div><span class="badge">${roupa.categoria}</span></div>

  <div class="col-estoque">Qtd: ${roupa.estoque_qtd}</div>
  <div class="col-cor">${roupa.cor}</div>
  <div class="col-preco produtos-preco">R$ ${Number(roupa.preco).toFixed(2)}</div>

  <div class="produtos-acoes">
    <button class="btn-acao btn-editar-roupa" data-id="${roupa.id}">Editar</button>
    <button class="btn-acao btn-excluir-roupa" data-id="${roupa.id}">Excluir</button>
  </div>
`;
      card
        .querySelector(".btn-excluir-roupa")
        .addEventListener("click", async () => {
          const confirmar = confirm(`Deseja excluir Produto: ${roupa.nome}`);
          if (!confirmar) return
          listaProdutos.innerHTML = ' ';
          excluirRoupa(roupa.id);
        });
      card
        .querySelector(".btn-editar-roupa")
        .addEventListener("click", async () => {
          console.log("editando");
        });
      listaProdutos.appendChild(card);
    });
  } catch (err) {
    console.log(err.message);
    alert(err.message);
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
    carregarProdutos();
  } catch (err) {
    console.error(err.message);
  }
}

async function inserirRoupa(formData) {
  try {
    const res = await fetchAuth(`${API_ROUPAS}`, {
      method: 'POST',
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
      body: formData,
    });
    const dados = await res.json();
    if (!res.ok) {
      alert(dados.message);
      throw new Error(dados.message);
    }

    console.log(dados);
  } catch (err) {
    console.error(err.message);

  }
}
carregarProdutos();
