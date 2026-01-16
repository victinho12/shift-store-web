

async function fetchAuth(url, options = {}) {
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
    };
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
  return res;
}
