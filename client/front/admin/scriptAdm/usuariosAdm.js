import { API_LOGIN, API_CLIENT_KEY } from "../../script/services/config.js";

const btnLimpar = document.getElementById('btn-limpar');
const btnPesquisar = document.getElementById('btn-pesquisar');
const email = document.getElementById('email');

btnLimpar.addEventListener('click', () =>{
  email.value = '';
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
      <button class="delete" onclick = ${deletarUsuario(user.id)} >Excluir</button>
    </div>
  `;
  document.getElementById('lista-cards').appendChild(card);

}

async function deletarUsuario(id) {
  try{
    const resDelete = await fetchAuth(`${API_LOGIN}/${id}`,{
      method: "DELETE",
      headers:{
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      }
    });
    const dados_user_delete = await resDelete.json();
    carregarUsuarios(email);
    if(!resDelete.ok){
      console.error(dados_user_delete.msg);
      return
    }
  }catch(err){
    console.error(err.message)
  }
}




carregarUsuarios(email);
