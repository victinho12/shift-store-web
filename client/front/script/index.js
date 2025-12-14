const API = 'http://localhost:3000/roupas';
const limit = 100;
const offset = 0

const API_CLIENT_KEY = "VICTOR_EDUARDO_MARTINS_123";

const lista_produtos_shift = document.getElementById("lista-produtos");

async function carregarProdutos() {
    try{
        const res =  await fetch(`${API}/?limit=${limit}&offset=${offset}`, {
            headers: {
                "shift-api-key": API_CLIENT_KEY
            }
                
        });
        const resJson = await res.json();

        resJson.forEach(roupa => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
            <h1>${roupa.nome}</h1>
            <br>
            <h3>Cor ${roupa.cor}</h3>
            <br>
            <h2>R$${roupa.preco}</h2>
            `
            lista_produtos_shift.appendChild(card);
        });
    }catch(err){
        console.log(err.message)
    }
}
carregarProdutos();
