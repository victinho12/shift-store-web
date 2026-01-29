function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.preco * item.qtd;

    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="http://localhost:3000/uploads/${item.img}">
        <div class="cart-item-info">
          <h4>${item.nome}</h4>
          <span>Qtd: ${item.qtd}</span>
        </div>
        <div class="cart-item-price">
          R$ ${(item.preco * item.qtd).toFixed(2)}
        </div>
      </div>
    `;
  });

  cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}
function addToCart(produto) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const itemExistente = cart.find((item) => item.id === produto.id);

  if (itemExistente) {
    itemExistente.qtd += 1;
  } else {
    cart.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      img: produto.img,
      qtd: 1,
    });
  }
  


  localStorage.setItem("cart", JSON.stringify(cart));
}
function atualizaCart() {
  couter = parseInt(localStorage.getItem("couterCar")) || 0;
  cartNun.textContent = couter;
}