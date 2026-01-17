function logoutUser() {
  console.log("deslogando");
  localStorage.removeItem("token");
  localStorage.removeItem("nome");
  localStorage.removeItem("refreshToken");
  window.location.href = "./index.html";
}
