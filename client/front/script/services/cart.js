// fazer o cart da aplicação com js puro
import { API_CLIENT_KEY, API_CART, getUserFromToken, fetchAuth } from "./config"

async function addToCart(id_usuario, id_produto_variacao, quantidade) {
    try {
        const res = await fetchAuth(API_CART, {
            method: // fazer fetch do carrinho
        })
    } catch (err) {
        console.error(err.message);
        alert(err.message);
    }
}