import { API_LOGIN, API_CLIENT_KEY, validarTokenFront, API_CHEKOUT, exibirNome, fetchAuth } from "../../script/services/config.js";



async function exibirVendas() {
    try{
        const res = await fetchAuth(`${API_CHEKOUT}`,{
            headers: {
                "shift-api-key": API_CLIENT_KEY
            }
        });
        const dados = await res.json();
        if(!res.ok) return console.log("Não foi possivel ver os dados da venda", dados);
        console.log(dados);
    }catch(err){
        alert(err.message);
    }
}
//fazer uma função para ler os dados e passar para o fronto, fazer uma função com forEach para ler esses dados junto com um botão de ver detalhes que fazer outra requisição para ver esses detalhes de compra
//a função que fazer a requisição dos detalhes pode abri um modal com os detlhes da venda para ficar de melhor visialização

await exibirVendas()