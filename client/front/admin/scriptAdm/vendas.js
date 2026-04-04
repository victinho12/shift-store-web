import {
  API_LOGIN,
  API_CLIENT_KEY,
  validarTokenFront,
  API_CHEKOUT,
  exibirNome,
  fetchAuth,
} from "../../script/services/config.js";

let divModal = document.getElementById('modal-detalhes');
function fecharModal(){
divModal.innerHTML = '';
}
fecharModal();



async function exibirVendas() {
  try {
    const res = await fetchAuth(`${API_CHEKOUT}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    });
    const dados = await res.json();
    if (!res.ok) return console.log("Não foi possivel ver os dados da venda " + dados);
    console.log(dados);
    renderizarTabela(dados.venda);
    console.log(dados);
  } catch (err) {
    alert(err.message);
  }
}

function renderizarTabela(dados) {
  let listaTabela = document.getElementById("tbody-vendas");

  listaTabela.innerHTML = "";
  dados.forEach((venda) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${venda.id_venda}</td>
        <td>${venda.nome}</td>
        <td>${venda.email}</td>
        <td>${venda.metodo_pagamento}</td>
        <td>R$ ${venda.valor_total}</td>
        <td>${venda.parcelas}</td>
        <td>${formatarData(venda.data_compra)}</td>
            <td>
                <button class="btn-detalhes" data-id="${venda.id}">
                    Ver
                </button>
            </td>
    `;
    listaTabela.appendChild(tr);
  });
}
//fazer uma função para ler os dados e passar para o fronto, fazer uma função com forEach para ler esses dados junto com um botão de ver detalhes que fazer outra requisição para ver esses detalhes de compra
//a função que fazer a requisição dos detalhes pode abri um modal com os detlhes da venda para ficar de melhor visialização
function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}

async function verDetalhes(id){
    try{
        
    }catch(err){
        console.error(err.message);
    }
} 


await exibirVendas();
