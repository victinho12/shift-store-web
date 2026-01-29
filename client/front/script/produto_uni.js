import { API_ROUPAS, API_CLIENT_KEY } from "./services/config.js";

// ========== pegando valores do localstorage ==========
const nome_value = localStorage.getItem("nome");
let couter = 0;
// ========== Pagando id do html ==========
const cartNun = document.getElementById('carrinho');
const nome = document.getElementById("nome_cliente");
const btnLogout = document.getElementById("logout-btn");
const lista_produtos_shift = document.getElementById("lista-produtos");
const cartOverlay = document.getElementById("cart-overlay");
const btnCloseCart = document.getElementById("btn-close-cart");
const btnCartIcon = document.querySelector(".carrinhoStyle");

if (nome_value) {
  nome.textContent = nome_value;
  nome.style.display = "block";
} else {
  nome.textContent = "user";
  nome.style.display = "block";
}

// ========== Elementos de click ==========
btnCartIcon.addEventListener("click", () => {
  cartOverlay.classList.remove("hidden");
  renderCart();
});
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("btn-add")) {
    const btn = e.target;
    const produto = {
      id: btn.dataset.id,
      nome: btn.dataset.nome,
      preco: parseFloat(btn.dataset.preco),
      img: btn.dataset.img
    };

    addToCart(produto);
    couter = couter + 1
    localStorage.setItem("couterCar", couter)
    cartNun.textContent = localStorage.getItem("couterCar")
    renderCart(); // Atualiza o carrinho automaticamente
    
  }
});

btnCloseCart.addEventListener("click", () => {
  cartOverlay.classList.add("hidden");
});
btnLogout.addEventListener("click", logoutUser);

const params = new URLSearchParams(window.location.search);
const produtoId = params.get("id");

async function carregarProdutoUni(produtoId) {
  try {
    mostrarSkeleton(1);
    const res = await fetchAuth(`${API_ROUPAS}${produtoId}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    });

    if (!res.ok) {
      const erroText = await res.text();
      throw new Error(erroText);
    }

    const resJson = await res.json();

    lista_produtos_shift.innerHTML = ""; // remove skeleton

    resJson.forEach((roupa) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
  <div class="card-img">
      <img 
        src="http://localhost:3000/uploads/${roupa.img}" 
        alt="${roupa.nome_roupa}" 
        
      />
      <div class="bar-img">d</div>
    </div>

    <div class="card-info">
      <h2 class="card-title">${roupa.nome_roupa}</h2>
      <span class="card-category">${roupa.cate_nome}</span>

      <div class="card-details">
        <p><strong>Cor:</strong> ${roupa.cor}</p>
        <p><strong>Tamanho:</strong> ${roupa.tamanho}</p>
        <p><strong>Estoque:</strong> ${roupa.quantidade}</p>
      </div>

      <div class="card-footer">
        <p class="card-price">
          R$ ${Number(roupa.preco).toFixed(2)}
        </p>
        <button class="btn-add"
  data-id="${roupa.id}"
  data-nome="${roupa.nome_roupa}"
  data-preco="${roupa.preco}"
  data-img="${roupa.img}">
  Adicionar
</button>
      </div>
    </div>
`;
      lista_produtos_shift.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar produto:", err.message);
  }
}

function mostrarSkeleton(qtd = 20) {
  lista_produtos_shift.innerHTML = "";

  for (let i = 0; i < qtd; i++) {
    const skeleton = document.createElement("div");
    skeleton.classList.add("card", "skeleton");

    skeleton.innerHTML = `
      <div class="card-img"></div>
      <div class="card-info">
        <div class="skeleton-text title"></div>
        <div class="skeleton-text small"></div>
        <div class="skeleton-text price"></div>
        <div class="skeleton-btn"></div>
      </div>
    `;

    lista_produtos_shift.appendChild(skeleton);
  }
}

carregarProdutoUni(produtoId);
atualizaCart()
