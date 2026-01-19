const API = "http://localhost:3000/user";
const API_LOGIN = "http://localhost:3000/user/login";

const email = document.getElementById("email");

const senha = document.getElementById("senha");

const btnEntrar = document.getElementById("btn-entrar");

const API_CLIENT_KEY = "VICTOR_EDUARDO_MARTINS_123";

const nome = document.getElementById("nome_cliente");


const hamburger = document.getElementById("hamburger");
const menu = document.querySelector(".header-infos");

hamburger.addEventListener("click", () => {
  menu.classList.toggle("active");
});


const btnLogout = document.getElementById("logout-btn");
btnLogout.addEventListener("click", logoutUser);

const nome_value = localStorage.getItem("nome");
if(nome_value){
  nome.textContent = nome_value;
  nome.style.display = "block";
}else{
  nome.textContent = "user";
  nome.style.display = "block";
}

btnEntrar.addEventListener("click", async () => {
  try{
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");

  if (!validarEmail(email)) return;
  const buscarUser = await fetch(API_LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "shift-api-key": API_CLIENT_KEY,
    },
    body: JSON.stringify({
      email: email.value,
      senha: senha.value,
    }),
  });
  const dadosUser = await buscarUser.json();
  localStorage.clear()
  localStorage.setItem("token", dadosUser.token);
  localStorage.setItem("refreshToken", dadosUser.refreshToken)
  localStorage.setItem("nome", dadosUser.nome);
  console.log(dadosUser.getUserByTokenJson);

  if (!buscarUser.ok) {
    alert(dadosUser.msg);
    localStorage.clear()
  } else {
    alert(`seja bem vindo(a) de volta, ${dadosUser.nome}`);
    limparCampos(email, senha);
    window.location.href = "./home.html";
  }
  }catch(err){
    console.error(err.message);
  }
});


//função de validar email com regex
function validarEmail(email) {
  let validar = true;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    email.value = "";
    email.placeholder = "Email inválido (ex: nome@email.com)";
    email.classList.add("erro");
    return (validar = false);
  }
  email.classList.remove("erro");
  return validar;
}
//função pra limpar os campos do input quando o ususario realizar o login
function limparCampos(email, senha){
  email.value = "";
  senha.value = "";
}



