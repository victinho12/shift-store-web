import { API_LOGIN, API_CLIENT_KEY, validarTokenFront, fetchAuth } from "../../script/services/config.js";

validarTokenFront();

let userIdSelecionado = null;
const btnCarregarUsuarios = document.getElementById("carregar-user");
const form = document.getElementById("form-pesquisa");
const listCards = document.getElementById("lista-cards");
const btnLimpar = document.getElementById("btn-limpar");
const email = document.getElementById("email");
const modal = document.getElementById("conteiner-update");
const fecherModal = document.getElementById("fechar-jenela");
const nomeInput = document.getElementById("nome-input");
const emailInput = document.getElementById("email-input");
const btnSalvarInput = document.getElementById("btn-mandar-modal");
const btnVoltarDash = document.getElementById("btn-voltar-dashboard");

// inserir user/adm
const btnAbrirModalUser = document.getElementById("btn-abrir-modal-adm");
const modalAddUser = document.getElementById("add-produtos");
const fecherModalUser = document.getElementById("fechar-jenela-user");
const btnAddUser = document.getElementById("btn-modal-add-user");
const nomeModalAdd = document.getElementById("nome-input-add");
const emailModalAdd = document.getElementById("email-input-add");
const senhaModalAdd = document.getElementById("senha-input-add");
const tipo_user = document.getElementById("tipo-input-add");

btnAddUser.addEventListener("click", () => {
  inserirAdm(nomeModalAdd.value, emailModalAdd.value, senhaModalAdd.value, tipo_user?.value);
});

fecherModalUser.addEventListener("click", () => {
  modalAddUser.style.display = "none";
});

btnAbrirModalUser.addEventListener("click", () => {
  modalAddUser.style.display = "block";
});

btnCarregarUsuarios.addEventListener("click", () => {
  carregarUsuarios(email);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!email.value.trim()) {
    alert("O campo e-mail é obrigatório");
    email.focus();
    return;
  }

  carregarUsuarios(email);
});

btnVoltarDash.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

fecherModal.addEventListener("click", () => {
  modal.style.display = "none";
});

btnLimpar.addEventListener("click", () => {
  email.value = "";
});

btnSalvarInput.addEventListener("click", async () => {
  const confirmar = confirm("Deseja realmente alterar esse usuário?");
  if (!confirmar) return;

  await atualizaUsuario(userIdSelecionado, nomeInput.value, emailInput.value);
  listCards.innerHTML = "";
  await carregarUsuarios(email);
  modal.style.display = "none";
});

async function carregarUsuarios(email) {
  try {
    listCards.innerHTML = "";
    const emailValor = email.value?.trim() || "";

    const resUser = await fetchAuth(`${API_LOGIN}/?email=${emailValor}`, {
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
    });

    const dados_user = await resUser.json();
    if (!resUser.ok) {
      alert(dados_user.msg);
      return;
    }

    dados_user.forEach((user) => criarLinhaUser(user));
  } catch (err) {
    console.error(err.message);
  }
}

/* ✅ AGORA É LINHA (tabela-grid), não card */
function criarLinhaUser(user) {
  const row = document.createElement("div");
  row.classList.add("usuarios-row");

  const inicial = (user.nome?.[0] || "?").toUpperCase();
  const tipo = user.tipo_user || "user";

  row.innerHTML = `
    <div class="usuario-info">
      <div class="user-avatar">
        <span>${inicial}</span>
      </div>

      <div class="usuario-textos">
        <strong>${user.nome}</strong>
        <small>${user.email}</small>
      </div>
    </div>

    <div class="usuario-email">
      ${user.email}
    </div>

    <div class="col-tipo">
      <span class="badge">${tipo}</span>
    </div>

    <div class="col-id">
      ${user.id}
    </div>

    <div class="usuarios-acoes">
      <button class="btn-acao btn-editar-user" data-id="${user.id}">Editar</button>
      <button class="btn-acao btn-excluir-user" data-id="${user.id}">Excluir</button>
    </div>
  `;

  row.querySelector(".btn-editar-user").addEventListener("click", async () => {
    userIdSelecionado = user.id;
    abrirModal();
    await buscarUserPorId(user.id);
  });

  row.querySelector(".btn-excluir-user").addEventListener("click", async () => {
    const confirmar = confirm(`Deseja mesmo apagar esse usuário: ${user.nome}`);
    if (!confirmar) return;
    await deletarUsuario(user.id);
    row.remove();
  });

  listCards.appendChild(row);
}

async function deletarUsuario(id) {
  try {
    await fetchAuth(`${API_LOGIN}/${id}`, {
      method: "DELETE",
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    });
  } catch (err) {
    console.error(err.message);
  }
}

async function atualizaUsuario(id, nome, email) {
  try {
    const updateUser = {};
    if (nome?.trim()) updateUser.nome = nome.trim();
    if (email?.trim()) updateUser.email = email.trim();

    await fetchAuth(`${API_LOGIN}/update/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
      body: JSON.stringify(updateUser),
    });
  } catch (err) {
    console.error(err.message);
  }
}

async function buscarUserPorId(id) {
  try {
    const selectId = await fetchAuth(`${API_LOGIN}/buscar/${id}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    });

    const dados_user_id = await selectId.json();
    document.getElementById("nome-user").textContent = dados_user_id[0].nome;
    document.getElementById("email-user").textContent = dados_user_id[0].email;
  } catch (err) {
    console.error(err.message);
  }
}

async function inserirAdm(nome, email, senha, tipo_user) {
  try {
    const addUser = {
      nome: nome?.trim(),
      email: email?.trim(),
      senha,
      tipo_user: (tipo_user || "user").trim(),
    };

    const res = await fetchAuth(`${API_LOGIN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
      body: JSON.stringify(addUser),
    });

    const dados = await res.json();
    if (!res.ok) {
      alert(dados.msg);
      return;
    }

    await carregarUsuarios(document.getElementById("email")); // recarrega a lista
    modalAddUser.style.display = "none";
  } catch (err) {
    console.error(err.message);
  }
}

function abrirModal() {
  modal.style.display = "block";
}

carregarUsuarios(email);
