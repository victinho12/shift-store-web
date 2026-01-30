
import { API_LOGIN, API_CLIENT_KEY } from "../../script/services/config.js";

let userIdSelecionado = null;
const btnCarregarUsuarios = document.getElementById('carregar-user');
const form = document.getElementById('form-pesquisa');
const listCards = document.getElementById("lista-cards");
const btnLimpar = document.getElementById('btn-limpar');
const email = document.getElementById('email');
const modal = document.getElementById('conteiner-update');
const fecherModal = document.getElementById('fechar-jenela');
const nomeInput = document.getElementById('nome-input');
const emailInput = document.getElementById('email-input');
const btnSalvarInput = document.getElementById('btn-mandar-modal');
const btnVoltarDash = document.getElementById("btn-voltar-dashboard");


//parte do sistema do adm que vai inserir novos user no sistema
const btnAbrirModalUser = document.getElementById('btn-abrir-modal-adm');
const modalAddUser = document.getElementById('add-produtos');
const fecherModalUser = document.getElementById('fechar-jenela-user');
const btnAddUser = document.getElementById('btn-modal-add-user');
const nomeModalAdd = document.getElementById('nome-input-add');
const emailModalAdd = document.getElementById('email-input-add');
const senhaModalAdd = document.getElementById('senha-input-add');
const tipo_user = document.getElementById('tipo-input-add')

btnAddUser.addEventListener('click', () => {
  inserirAdm(nomeModalAdd, emailModalAdd, senhaModalAdd, tipo_user);
})
fecherModalUser.addEventListener('click', () => {
  modalAddUser.style.display = 'none';
})

btnAbrirModalUser.addEventListener('click', () => {
  modalAddUser.style.display = 'block';
})

btnCarregarUsuarios.addEventListener('click', () => {
  alert('Carregando');
  carregarUsuarios(email);
})

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!email.value.trim() || email.textContent === ' ') {
    alert("O campo e-mail é obrigatório");
    email.focus();
    return;
  }
  alert("Pesquisando usuario");
  carregarUsuarios(email);
});

btnVoltarDash.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

fecherModal.addEventListener('click', () => {
  modal.style.display = 'none';
  carregarUsuarios(email);
});
btnLimpar.addEventListener('click', () => {
  email.value = ' ';
});

btnSalvarInput.addEventListener('click', () => {
  const confirmar = confirm("Deseja realmete alterar esse usuario?");
  if (!confirmar) return
  atualizaUsuario(userIdSelecionado, nomeInput.value, emailInput.value);
  modal.style.display = 'none';
  carregarUsuarios(email);
});


async function carregarUsuarios(email) {
  try {
    listCards.innerHTML = '';
    const emailValor = email.value?.trim() || "";
    const resUser = await fetchAuth(`${API_LOGIN}/?email=${emailValor}`, {
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      }
    })

    const dados_user = await resUser.json();
    if (!resUser.ok) {
      alert(dados_user.msg)
    }
    dados_user.forEach((user) => criarCardUser(user));


  } catch (err) {
    console.error(err.message);
  }
};

function criarCardUser(user) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <div class="user-avatar">
      <span>${user.nome[0]?.toUpperCase()}</span>
    </div>

    <div class="user-info">
      <h3>${user.nome}</h3>
      <p>Tipo: ${user.tipo_user}</p>
      <small>${user.email}</small>
    </div>

    <div class="user-actions">
      <button class="edit">Editar</button>
      <button class="delete">Excluir</button>
    </div>
  `;



  card.querySelector('.edit').addEventListener('click', async () => {
    userIdSelecionado = user.id
    abrirModal();
    buscarUserPorId(user.id);
  });


  card.querySelector(".delete").addEventListener("click", async () => {
    const confirmar = confirm(`Deseja mesmo apagar esse usuario: ${user.nome}`);
    if (!confirmar) return
    deletarUsuario(user.id);
    card.remove();
  });
  document.getElementById('lista-cards').appendChild(card);

};



async function deletarUsuario(id) {
  try {
    await fetchAuth(`${API_LOGIN}/${id}`, {
      method: "DELETE",
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      }
    });
    carregarUsuarios(email);
  } catch (err) {
    console.error(err.message);
  }
};

async function atualizaUsuario(id, nome, email) {
  try {
    const updateUser = {};
    if (nome) updateUser.nome = nome;
    if (email) updateUser.email = email;

    const res = await fetchAuth(`${API_LOGIN}/update/${id}`, {
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
};

async function buscarUserPorId(id) {
  try {
    const selectId = await fetchAuth(`${API_LOGIN}/buscar/${id}`,
      {
        headers: {
          "shift-api-key": API_CLIENT_KEY,
        }
      }
    );
    let dados_user_id = await selectId.json();
    document.getElementById('nome-user').textContent = dados_user_id[0].nome;
    document.getElementById('email-user').textContent = dados_user_id[0].email;

  } catch (err) {
    console.error(err.message);
  }
};


async function inserirAdm(nome, email, senha, tipo_user) {
  try {
    const addUser = { nome, email, senha, tipo_user };

    const res = await fetchAuth(`${API_LOGIN}`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
      body: JSON.stringify(addUser)
    });
    if(!addUser.ok){
      console.error(addUser.msg)
    }
    const dados = await res.json();
    console.log(dados);
  } catch (err) {
    console.error(err.message);
  }
}


function abrirModal() {
  modal.style.display = 'block';
};


carregarUsuarios(email);
