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
let idRoupaUpdate = null;
const btnVoltarDash = document.getElementById('btn-voltar-dashboard');
const ModalInserirRoupas = document.getElementById("add-produtos");
const modalUpdate = document.getElementById('modal-update');
const btnMoldalAddProduto = document.getElementById("btn-card");
const listaProdutos = document.getElementById("lista-produtos");
const btnInserirRoupa = document.getElementById("btn-inserir-roupa");
const form = document.getElementById("form-produto");
const formUpdate = document.getElementById('form-produto-update');
const btnPesquisarProduto = document.getElementById("btn-pesquisar");
const btnCarregarProduto = document.getElementById('carregar-produtos');
const btnSalvarUpdate = document.getElementById('btn-salvar-update');
btnCarregarProduto.addEventListener('click', () => {
  const confirmar = confirm('Deseja carregar todos os produtos?');
  if (!confirmar) return;
  carregarProdutos();
});
btnVoltarDash.addEventListener('click', () => { window.location.href = 'dashboard.html' });

btnPesquisarProduto.addEventListener('click', () => {
  let nome = document.getElementById("pesquisar-produto").value;
  alert('Pesquisando Produto')
  console.log(nome);
  carregarProdutos(nome);
});

btnSalvarUpdate.addEventListener('click', async (e))// linha que vai ser add para atualizer os produtos //


form.addEventListener("submit", (e) => {
  e.preventDefault(); // impede submit/reload
});

btnInserirRoupa.addEventListener("click", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  await inserirRoupa(formData);
  window.addEventListener("beforeunload", (e) => {
    console.log("beforeunload disparou (vai sair/recarregar)");
  });
  alert("Roupa adicionada com succeso");
});
btnMoldalAddProduto.addEventListener("click", () => {
  ModalInserirRoupas.style.display = "flex";
});

btnFecharModalAddProdutos.addEventListener("click", () => {
  ModalInserirRoupas.style.display = "none";
});

async function carregarProdutos(nome) {
  try {
    if (nome === undefined || !nome) nome = ''
    const res = await fetchAuth(`${API_ROUPAS}genero/?nome=${nome}`, {
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
          modalUpdate.style.display = 'flex'; 
          idRoupaUpdate = roupa.id;
          formUpdate.nome.value = roupa.nome;
          formUpdate.cor.value = roupa.cor;
          formUpdate.tamanho.value = roupa.tamanho;
          formUpdate.preco.value = roupa.preco;
          formUpdate.quantidade.value = roupa.estoque_qtd;
          formUpdate.categoria.velue = roupa.categoria; 
          
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
      throw new Error(dados.message);
    }

    console.log(dados);
  } catch (err) {
    console.error(err.message);

  }
};

async function atualizarRoupa(id, formDataUpdate) {
  try {
    const res = await fetchAuth(`${API_ROUPAS}update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
      body: formDataUpdate
      });
    const dados = await res.json();
    if (!res.ok) {
      throw new Error(dados.message);
    };
    console.log(dados.data);
  } catch (err) {
    console.error(err.message);
  }
}



carregarProdutos();
