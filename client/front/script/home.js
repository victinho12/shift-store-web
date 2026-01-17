const token = localStorage.getItem("token");

if (!token) {
  // bloqueia acesso a pagina se não existir token
  window.location.href = "./index.html";
}

const API = "http://localhost:3000/roupas";
let limit = 4;
let offset = 0;
let couterCarrinho = 0;

const API_CLIENT_KEY = "VICTOR_EDUARDO_MARTINS_123";

const lista_produtos_shift = document.getElementById("lista-produtos");
const imgs = document.getElementById("img");
const img = document.querySelectorAll("#img img");

const btnLogout = document.getElementById("logout-btn");
btnLogout.addEventListener("click", logoutUser);

let idx = 0;
function carrocel() {
  idx++;
  if (idx > img.length - 1) {
    idx = 0;
  }
  imgs.style.transform = `translateX(${-idx * 100}%)`;
}
setInterval(carrocel, 3000);

const nome = document.getElementById("nome_cliente");

const nome_value = localStorage.getItem("nome");
if(nome_value){
  nome.textContent = nome_value;
  nome.style.display = "block";
}else{
  nome.textContent = "user";
  nome.style.display = "block";
}


async function carregarProdutos() {
  try {
    const res = await fetchAuth(`${API}/?limit=${limit}&offset=${offset}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
       
      },
    });

    if(!res.ok){
      const erroText = await res.text()
      throw new Error(erroText);
    }

    const resJson = await res.json();
    if(!resJson.ok){
      console.error(resJson.msg);
    }
    if(!Array.isArray(resJson)){
      console.error("Resposta inesperada", resJson)
      return;
    }

    resJson.forEach((roupa) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
  <div class="card-img">
    <img src="http://localhost:3000/uploads/${roupa.img}" alt="${roupa.nome}">
  </div>
  <div class="card-info">
    <h2 class="card-title">${roupa.nome}</h2>
    <p class="card-color">Cor: ${roupa.cor}</p>
    <p class="card-price">R$ ${Number(roupa.preco).toFixed(2)}</p>
    <button class="card-btn" onclick= couterCarrinhoFunc()>Adicionar ao carrinho</button>
  </div>
`;
      lista_produtos_shift.appendChild(card);
              });
  } catch (err) {
    console.error(err.message);
    alert(err.message);
  }
}
function couterCarrinhoFunc() {
  couterCarrinho = couterCarrinho + 1;
  const carrinho = (document.getElementById("carrinho").textContent =
    couterCarrinho);
}

carregarProdutos();
