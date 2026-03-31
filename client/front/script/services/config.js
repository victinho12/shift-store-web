export const API_ROUPAS = "http://localhost:3000/roupas/";
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
  const refreshRes = await fetch("http://localhost:3000/refresh-token", {
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

export function exibirNome() {
  const nome = localStorage.getItem("nome");
  return nome;
}

export function loading() {
  const div_carregando = document.getElementById("divLoad");
  const loading = document.createElement("div");
  loading.classList.add("loading");
  loading.innerHTML = `
    <img src="../assets/goku (1).png" alt="" />
    <p class="pontos">Carregando</p>`;
  div_carregando.appendChild(loading);
}
