// fazer o cart da aplicação com js puro
import { API_CLIENT_KEY, API_CART, getUserFromToken, fetchAuth } from "./services/config.js"
let id_usuario = getUserFromToken();
console.log(id_usuario)



export async function addToCart(id_usuario, id_produto_variacao, quantidade) {

    try {
        const payload ={
            id_usuario: Number(id_usuario),
            id_produto_variacao: Number(id_produto_variacao),
            quantidade: Number(quantidade)
        }
        const res = await fetchAuth(API_CART, {
            method: "POST",
            headers: {
                 "Content-Type": "application/json",
                "shift-api-key": API_CLIENT_KEY
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
    } catch (err) {
        console.error(err.message);
    }
}
export async function verCart(id_usuario) {
     let id = Number(id_usuario);
    try {
        const res = await fetchAuth(`${API_CART}/${id}`, {
            headers: {
                "shift-api-key": API_CLIENT_KEY
            }
        });
        const data = await res.json();
        if(!res.ok){ data.quantidade = 0
            throw new Error(data.message)}
        return Number(data.quantidade) || 0;
    } catch (err) {
        console.error(err.message);
    }
}
export async function carregarCart() {
  const nome = document.getElementById("nome_cliente")
  const nome_value = localStorage.getItem("nome");
if (nome_value) {
  nome.textContent = nome_value;
  nome.style.display = "block";
} else {
  nome.textContent = "user";
  nome.style.display = "block";
}

  const container = document.getElementById("cart-items");
  const emptyContainer = document.getElementById("cart-empty");
  const badge = document.getElementById("cart-count");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");

  const formatBRL = (value) =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  try {
    const res = await fetchAuth(`${API_CART}/${id_usuario}`, {
      headers: { "shift-api-key": API_CLIENT_KEY }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    container.innerHTML = "";
    emptyContainer.innerHTML = "";

    if (!data.ok || data.data.length === 0) {
      emptyContainer.innerHTML = `
        <div class="cart-emptyBox">
          <h2>Você ainda não tem nada no carrinho</h2>
          <p>Que tal dar uma olhada nos nossos produtos?</p>
          <div class="btn-add-cart">
            <button onclick="window.location.href='./produtos.html'">
              Ver produtos
            </button>
          </div>
        </div>
      `;
      badge.textContent = "0";
      subtotalEl.textContent = "R$ 0,00";
      totalEl.textContent = "R$ 0,00";
      return;
    }

    // badge total
    badge.textContent = data.quantidade;

    let subtotalGeral = 0;

    data.data.forEach((produto) => {

      const quantidade = Number(produto.qtd_carrinho);
      const valorTotalItem = Number(produto.valor_total);
      const precoUnitario = valorTotalItem / quantidade;

      subtotalGeral += valorTotalItem;

      const card = document.createElement("article");
      card.classList.add("cart-item");
      card.dataset.preco = precoUnitario;

      card.innerHTML = `
        <div class="cart-prod">
          <p class="cart-name">${produto.produto_nome_solicitado}</p>
          <p class="cart-meta">
            Cor: ${produto.produto_cor_solicitado} • Tam: ${produto.produto_tamanho_solicitado}
          </p>
        </div>

        <p class="right">${formatBRL(precoUnitario)}</p>

        <div class="center">
          <input class="cart-qty-input" type="number" min="1" value="${quantidade}" />
        </div>
        <div class="quantidade-mais"><button class="mais">+</button></div>
        <div class="quantidade-menos"><button class="menos">-</button></div>
        <p class="right cart-green">
          ${formatBRL(valorTotalItem)}
        </p>

        <div class="right">
          <button class="cart-remove" type="button">✕</button>
        </div>
      `;
        card.querySelector('.cart-remove').addEventListener('click', async () => {
            console.log("id od cart Front", produto.cart_id_item);
            await removerCart(produto.cart_id_item);
            await carregarCart();
        });
        card.querySelector(".mais").addEventListener("click", async () => {
          console.log(`id do produto: ${produto.cart_id_item} quantidade: ${quantidade}`);
            await atualizaCartQuantidade(quantidade + 1, produto.cart_id_item);
            await carregarCart();
        });
        card.querySelector(".menos").addEventListener("click", async () => {
          console.log(`id do produto: ${produto.cart_id_item} quantidade: ${quantidade}`);
          await atualizaCartQuantidade(quantidade - 1, produto.cart_id_item);
          await carregarCart();
        });
      container.appendChild(card);
    });

    subtotalEl.textContent = formatBRL(subtotalGeral);
    totalEl.textContent = formatBRL(subtotalGeral);

  } catch (err) {
    console.error(err.message);
  }
}

async function removerCart(id_carrinho_item) {
    try{
        console.log("id od cart Front", id_carrinho_item);
        const res = await fetchAuth(`${API_CART}/${id_carrinho_item}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "shift-api-key": API_CLIENT_KEY
            }
        });
        const data = await res.json();
        console.log(data.data, "item excluido com sucesso");
    }catch(err){
        console.error(err.message)
    }
}
async function atualizaCartQuantidade(quantidade, id_carrinho_item) {
    try{
      const payload = {quantidade}
      const res = await fetchAuth(`${API_CART}/${id_carrinho_item}`, {
        method: "PUT",
        headers:{
          "Content-Type": "application/json",
          "shift-api-key": API_CLIENT_KEY
        },
        body: JSON.stringify(payload)
      });
      let data = await res.json();
      if(!res.ok) throw new Error(`não foi possivel realizar a atualização da quantidade ${data.message}`);

    }catch(err){
      console.error(err.message);
    }
}

// chama automaticamente se estiver na página do carrinho
if (window.location.pathname.includes("cart")) {
  carregarCart();
}

