// TERMINAR até receber o monitor
const API = "http://localhost:3000/user";

const API_CLIENT_KEY = "VICTOR_EDUARDO_MARTINS_123";

const btnInsertUser = document.getElementById("btn-cadastro");

const btn_limpar_campos_input = document.getElementById("limpar_input");

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

    const fetchSelect = await fetch(`${API}/?email=${email.value}`, {
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
      const fetchInsert = await fetch(API, {
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
    }
  } catch (err) {
    console.log(err.message);
    alert(err.message);
  }
});

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

btn_limpar_campos_input.addEventListener("click", () => {
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  nome.value = "";
  email.value = "";
  senha.value = "";
});
