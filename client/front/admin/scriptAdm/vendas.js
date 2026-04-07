import {
  API_LOGIN,
  API_CLIENT_KEY,
  validarTokenFront,
  API_CHEKOUT,
  fetchAuth,
  loading
} from "../../script/services/config.js";

const btnVoltarDash = document.getElementById("btn-voltar-dashboard");

btnVoltarDash.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});



const modal = document.getElementById("modal-detalhes");

function fecharModal() {
  modal.classList.add('hidden');
}
const btnFechar = document.querySelector(".btn-fechar");
btnFechar.addEventListener("click", fecharModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    fecharModal();
  }
});


async function exibirVendas() {
  try {
    const res = await fetchAuth(`${API_CHEKOUT}`, {
      headers: {
        "shift-api-key": API_CLIENT_KEY,
      },
    });
    const dados = await res.json();
    if (!res.ok)
      return console.log("Não foi possivel ver os dados da venda " + dados);
    
    renderizarTabela(dados.venda);
    
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
                <button class="btn-detalhes" data-id="${venda.id_venda}">
                    Ver
                </button>
            </td>
    `;

    tr.querySelector('.btn-detalhes').addEventListener('click', (event) => {
    
    let vendaId = event.currentTarget.dataset.id; 
    verDetalhes(vendaId)
});


    listaTabela.appendChild(tr);
  });
}

function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}

async function verDetalhes(id) {
  const isId = Number(id);
  if (!Number.isInteger(isId) || isId < 1)
    alert("Precisa ser um id valido por favor consulte um desenvolvedor");
  try {
    const res = await fetchAuth(`${API_CHEKOUT}/${id}`, {
      headers:{
        'shift-api-key': API_CLIENT_KEY
      }
    });
    const dados = await res.json();
    cardDetalhes(dados);
  } catch (err) {
    console.error(err.message);
  }
}
function cardDetalhes(dados) {
  const { detalhes } = dados;
  modal.classList.remove('hidden');

  const modalProduto = document.getElementById("modal-produto");
  const modalQuantidade = document.getElementById("modal-quantidade");
  const modalPreco = document.getElementById("modal-preco");
  const modalSubtotal = document.getElementById("modal-subtotal");
  const modalTamanho = document.getElementById("modal-tamanho");
  const modalId = document.getElementById("modal-id");
  const modalData = document.getElementById("modal-data");
  const modalParcela = document.getElementById("modal-parcela");

  modalProduto.textContent = detalhes.produto;
  modalQuantidade.textContent = detalhes.quantidade_solicitada;
  modalPreco.textContent = detalhes.preco_unitario;
  modalSubtotal.textContent = detalhes.subtotal;
  modalTamanho.textContent = detalhes.tamanho;
  modalId.textContent = detalhes.id_vendas;
  modalParcela.textContent = detalhes.parcelas
  modalData.textContent = formatarData(detalhes.data_da_compra);
}

await exibirVendas();
