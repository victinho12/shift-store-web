
import { API_LOGIN, API_CLIENT_KEY } from "../../script/services/config.js";

const btnLimpar = document.getElementById('btn-limpar');
const btnPesquisar = document.getElementById('btn-pesquisar');
const email = document.getElementById('email');
const modal = document.getElementById('conteiner-update');
const fecherModal = document.getElementById('fechar-jenela');

fecherModal.addEventListener('click', () =>{
  modal.style.display = 'none';
})
btnLimpar.addEventListener('click', () =>{
  email.value = ' ';
})

btnPesquisar.addEventListener('click', () => {
  document.getElementById('lista-cards').innerHTML = '';
  carregarUsuarios(email);
})


async function carregarUsuarios(email) {
  try {
    if(!email){
      email = " ";
    }
    const resUser = await fetchAuth(`${API_LOGIN}/?email=${email.value}`,{
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      }
    })
    
    const dados_user = await resUser.json();
    if(!resUser.ok){
        alert(dados_user.msg)
    }
    dados_user.forEach((user) => criarCardUser(user));


  } catch (err) {
    console.error(err.message);
  }
}

function criarCardUser(user) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <div class="user-avatar">
      <span>${user.nome[0]}</span>
    </div>

    <div class="user-info">
      <h3>${user.nome}</h3>
      <p>${user.tipo_user}</p>
      <small>${user.email}</small>
    </div>

    <div class="user-actions">
      <button class="edit">Editar</button>
      <button class="delete">Excluir</button>
    </div>
  `;

  card.querySelector('.edit').addEventListener('click', async () => {
    abrirModal();
    buscarUserPorId(user.id);
       
  })

  card.querySelector(".delete").addEventListener("click", async () => {
    
    deletarUsuario(user.id);
    card.remove();
  })
  document.getElementById('lista-cards').appendChild(card);

}

async function deletarUsuario(id) {
  try{
    await fetchAuth(`${API_LOGIN}/${id}`,{
      method: "DELETE",
      headers:{
        "shift-api-key": API_CLIENT_KEY,
      }
    });
    card.innerHTML = ' '
    carregarUsuarios(email);
  }catch(err){
    console.error(err.message)
  }
}

async function atualizaUsuario(id, nome, email) {
  try {

    const updateUser = {nome, email};
    await fetchAuth(`${API_LOGIN}/update${id}`, {
      method: "PATCH",
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
      body: JSON.stringify(updateUser),
    });
    
  } catch (err) {
    
  }
}

async function buscarUserPorId(id) {
 try{
  const selectId = await fetchAuth(`${API_LOGIN}/buscar/${id}`,
    {
      headers: {
         "shift-api-key": API_CLIENT_KEY,
      }
    }
  );
  let dados_user_id = await selectId.json();
  console.log(dados_user_id);
  document.getElementById('nome-user').textContent = dados_user_id[0].nome;
  document.getElementById('email-user').textContent = dados_user_id[0].email;

 }catch(err){
  console.error(err.message);
 } 
}

function abrirModal(){
  modal.style.display = 'block';
}


carregarUsuarios(email);
