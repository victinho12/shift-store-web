export const API_ROUPAS = "http://localhost:3000/roupas/";
export const API_LOGIN = "http://localhost:3000/user";
export const API_CLIENT_KEY = "VICTOR_EDUARDO_MARTINS_123";

export function validarTokenFront() {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "../view/home.html");

  try {
    const user = JSON.parse(atob(token.split(".")[1]));
    if (user.tipo_user !== "admin")
      return (window.location.href = "../view/home.html");
    console.log("Token ok", user.tipo_user);
  } catch {
    localStorage.clear();
    window.location.href = "../view/home.html";
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
};

