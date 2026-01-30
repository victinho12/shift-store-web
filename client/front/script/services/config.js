export const API_ROUPAS = "http://localhost:3000/roupas/";
export const API_LOGIN = "http://localhost:3000/user";
export const API_CLIENT_KEY = "VICTOR_EDUARDO_MARTINS_123";

export function validarTokenFront() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(atob(token.split(".")[1]));
  if (!token || user.tipo_user !== "admin")
    return (window.location.href = "../view/home.html");
  console.log("Token passado com successo", user.tipo_user);
}

export async function fetchAuth(url, options = {}) {
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      //quando passar o autorization que paga o token dentro do localstorrege ele sempre vai ser passado desse jeito
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (res.status === 401) {
    const refreshRes = await fetch("http://localhost:3000/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "shift-api-key": API_CLIENT_KEY,
      },
      body: JSON.stringify({
        refreshToken: localStorage.getItem("refreshToken"),
      }),
    });
    if (!refreshRes.ok) {
      localStorage.clear();
      window.location.href = "./index.html";
      return;
    }
    const data = await refreshRes.json();
    localStorage.setItem("token", data.accessToken);

    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        authorization: `Bearer ${data.accessToken}`,
      },
    });
  }
  console.log("fetch Funcionando config");
  return res;
}

export function logoutUser() {
  console.log("deslogando config");
  localStorage.removeItem("token");
  localStorage.removeItem("nome");
  localStorage.removeItem("refreshToken");
  window.location.href = "./index.html";
}
