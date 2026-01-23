// ========== dados da api ==========
import { API_LOGIN, API_CLIENT_KEY } from "./services/config.js";
// ========== Pagando id do html ==========
const nome = document.getElementById("nome_cliente");
const btnInsertUser = document.getElementById("btn-cadastro");
const btn_limpar_campos_input = document.getElementById("limpar_input");
const btnLogout = document.getElementById("logout-btn");
// ========== pegando valores do localstorage ==========
const nome_value = localStorage.getItem("nome");
if(nome_value){
  nome.textContent = nome_value;
  nome.style.display = "block";
}else{
  nome.textContent = "user";
  nome.style.display = "block";
}
// ========== Elementos de click ==========
btnLogout.addEventListener("click", logoutUser);
btn_limpar_campos_input.addEventListener("click", () => {
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  nome.value = "";
  email.value = "";
  senha.value = "";
});
btnInsertUser.addEventListener("click", async () => {
  try {
    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");
    
    const campos = [
      { input: nome, msg: "preencha um nome de usuario" },
      { input: email, msg: "preencha um email valido" },
      { input: senha, msg: "preencha uma senha valida" },
    ];
    if (!validarCamposObrigatorios(campos)) return;

    if (!validarEmail(email)) return;

    const fetchSelect = await fetch(`${API_LOGIN}/?email=${email.value}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    });
    if (!fetchSelect.ok) {
      throw new Error("Erro ao verificar usuário");
    }
    let select = await fetchSelect.json();
    console.log(select.length);
    if (select.length == 1 || select.length > 1) {
      alert("usuario ja cadastrado");
      return;
    } else {
      const novoUser = {
        nome: nome.value,
        email: email.value,
        senha: senha.value,
      };
      const fetchInsert = await fetch(API_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "shift-api-key": API_CLIENT_KEY,
        },
        body: JSON.stringify(novoUser),
      });
      if (!fetchInsert.ok) {
        throw new Error("Error ou inserir");
      }

      alert("deu bom");
      console.log("deu bom");
      window.location.href = "./index.html";
    }
  } catch (err) {
    console.error(err.message);
    alert(err.message);
  }
});
// Validação de dados que são passados nos inputs
function validarCamposObrigatorios(campos) {
  let validar = true;
  campos.forEach(({ input, msg }) => {
    if (!input.value) {
      input.value = "";
      input.placeholder = msg;
      input.classList.add("erro");
      validar = false;
    } else {
      input.classList.remove("erro");
    }
  });
  return validar;
}
// Validar email do user com regex
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
//Validar a senha do usuario
function validarSenha(senha) {
  let validar = true;
  if (senha.value.length < 9) {
    senha.value = ""; // limpa o campo
    senha.placeholder = "A senha deve ter no mínimo 9 caracteres";
    senha.classList.add("erro"); // opcional
    return (validar = false);
  }
  return validar;
}


