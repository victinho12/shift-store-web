// fazer o cart da aplicação com js puro
import { API_CLIENT_KEY, API_CART, getUserFromToken, fetchAuth } from "./config.js"
getUserFromToken();
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
        if (!res.ok) throw new Error("Não foi possivel adicionar carrinho", + data.message);
    } catch (err) {
        console.error(err.message);
        alert(err.message);
    }
}
async function verCart(id_usuario) {
    try {

    } catch (err) {

    }
}