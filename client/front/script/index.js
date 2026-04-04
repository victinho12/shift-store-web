// Funções padrões para a janelas
import { API_LOGIN, API_CLIENT_KEY, logoutUser, exibirNomeFront } from "./services/config.js";
exibirNomeFront();
// Área para pegar elementos do html
const btnEntrar = document.getElementById("btn-entrar");
const btnLogout = document.getElementById("logout-btn");

// Desloga o usuario quando ele apertar para sair da conta que chama uma função chamada logout que remove seus tokens e atualiza a pagina
btnLogout.addEventListener("click", logoutUser);


btnEntrar.addEventListener("click", async () => {
  try {
    
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!validarEmail()) return;
    const novoUsuario = { email, senha}

    const res = await fetch(`${API_LOGIN}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
      body: JSON.stringify(novoUsuario),
    });
    const dados = await res.json();

    if (!res.ok) {
      alert(dados.msg);
      localStorage.clear();
      return;
    }
    preencherLocalStorage(dados);
    let redirecionamento = validarToken(dados);
    if(redirecionamento) return;

    limparCampos(email, senha);
    window.location.href = "./home.html";
  } catch (err) {
    console.error(err.message);
    alert(err.message);
  }
});

function validarToken(dados) {
  try {
    if (!dados || !dados.token) {
      return false
    }

    const token = dados.token;

    const partes = token.split(".");
    if (partes.length !== 3) {
      return false
    }

    const base64 = partes[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(atob(base64));

    // 🔐 valida expiração (se existir)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("Token expirado");
    }

    // 🔐 valida tipo de usuário
    if (payload.tipo_user === "admin") {
      window.location.href = "../admin/dashboard.html";
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}


//função de validar email com regex
function validarEmail() {
  let validar = true;
  const emailValidar = document.getElementById("email");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailValidar.value)) {
    emailValidar.value = "";
    emailValidar.placeholder = "Email inválido (ex: nome@email.com)";
    return (validar = false);
  }
  return validar;
}
//função pra limpar os campos do input quando o ususario realizar o login
function limparCampos(email, senha) {
  email = "";
  senha = "";
}
// Função que preenche os campos no localStoreage do navegador quando o usuario entra no sistema, é chamada na função
function preencherLocalStorage(dados){
  localStorage.removeItem('token');
  localStorage.removeItem('nome');
  localStorage.removeItem('refreshToken');
  localStorage.setItem("token", dados.token);
  localStorage.setItem("refreshToken", dados.refreshToken);
  localStorage.setItem("nome", dados.nome);
}
