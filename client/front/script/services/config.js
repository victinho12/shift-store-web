// export const API_ROUPAS = "https://shift-store-web.onrender.com/roupas";
// export const API_LOGIN = "https://shift-store-web.onrender.com/user";
// export const API_CART = "https://shift-store-web.onrender.com/cart";
// export const API_CLIENT_KEY = "VICTOR_EDUARDO_MARTINS_123";
// export const API_CHEKOUT = "https://shift-store-web.onrender.com/vendas";


export const API_ROUPAS = "http://localhost:3000/roupas";
export const API_LOGIN = "http://localhost:3000/user";
export const API_CART = "http://localhost:3000/cart";
export const API_CLIENT_KEY = "VICTOR_EDUARDO_MARTINS_123";
export const API_CHEKOUT = "http://localhost:3000/vendas";




export function validarTokenFront() {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "../view/home.html");
  try {
    const user = JSON.parse(atob(token.split(".")[1]));
    if (user.tipo_user !== "admin")
      return (window.location.href = "../view/home.html");
    console.log("validação de token ok", user.tipo_user);
  } catch {
    localStorage.clear();
    window.location.href = "../view/home.html";
  }
}
export function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return alert("loge para comprar um item");

  try {
    const user = JSON.parse(atob(token.split(".")[1])); // payload do JWT
    if (user.tipo_user === "")
      return (window.location.href = "../view/index.html");
    return user.id;
  } catch {
    localStorage.clear();
    window.location.href = "../view/index.html";
  }
}

export async function fetchAuth(url, options = {}) {
  const doFetch = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        authorization: `Bearer ${token}`,
      },
    });

  let token = localStorage.getItem("token");
  let res = await doFetch(token);

  if (res.status !== 401) return res;

  // tenta refresh
  const refreshToken = localStorage.getItem("refreshToken");
  const refreshRes = await fetch("https://shift-store-web.onrender.com/refresh-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "shift-api-key": API_CLIENT_KEY,
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshRes.ok) {
    localStorage.clear();
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const data = await refreshRes.json();
  localStorage.setItem("token", data.accessToken);

  // refaz request
  res = await doFetch(data.accessToken);
  return res;
}

export function logoutUser() {
  console.log("deslogando config");
  localStorage.removeItem("token");
  localStorage.removeItem("nome");
  localStorage.removeItem("refreshToken");
  window.location.href = "./index.html";
}

export function exibirNomeFront() {
  // pega nome no front
  const nome = document.getElementById("nome_cliente");
  // paga o nome no localstorage se ele ja estiver logado
  const getNome = localStorage.getItem("nome");

  // Se o getNome não existir e o nome do front também não existir, pro padrão ele seta um nome base
  if (!nome || !getNome) {
    // seta um nome por default
    nome.textContent = "Usuario";
    return;
  }
  // seta o nome do usuario no front
  nome.textContent = getNome;
}

export function getUserId() {
  const token = localStorage.getItem("token");
  const user = !token ? false : JSON.parse(atob(token?.split(".")[1]));
  let user_id = user === false ? false : Number(user.id);
  return user_id;
}

export function redirecionar(){
  window.location.href = '../../front/view/index.html'
}

export function loading(show = true) {
  
  const div_carregando = document.getElementById("divLoad");
  const existing = div_carregando.querySelector(".loading");
  if(!show) {
    if(existing) existing.remove(); 
    return;
  };
  if(existing) return;
  const loading = document.createElement("div");
  loading.classList.add("loading");
  loading.innerHTML = `
    <img src="../assets/goku (1).png" alt="" />
    <p class="pontos">Carregando</p>`;
  div_carregando.appendChild(loading);
  console.log("loading rodando");
}


export async function verQuantidadeCart() {
  try {
    const cartNun = document.getElementById("carrinho");
    const id = getUserId();
    const res = await fetchAuth(`${API_CART}/${id}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      data.quantidade = 0;
      throw new Error(data.message);
    }
    cartNun.textContent = data.quantidade
    return Number(data.quantidade) ?? 0;
  } catch (err) {
    console.error(err.message);
  }
}
