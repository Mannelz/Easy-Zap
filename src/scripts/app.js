// --- CHAVES DO LOCALSTORAGE ---
const STORAGE_KEY_CLIENTES = "zapApp_clientes_salvos";
const STORAGE_KEY_ENTREGADOR = "zapApp_nome_entregador"; // Novo
const DDD_PADRAO = "31";

// --- DADOS EMBUTIDOS ---
const EMPRESAS_PADRAO = [
  "Mercado Livre",
  "Shopee",
  "Loggi",
  "Amazon",
  "Magalu",
  "iFood",
  "Outro",
];
const MENSAGENS_PADRAO = [
  {
    title: "Pedido a Caminho",
    template:
      "Olá {nome}! Sou {entregador}, da {empresa}. Seu pedido está a caminho!",
  },
  {
    title: "Pedido Chegou (Aguardando Retirada)",
    template:
      "Oi {nome}, aqui é {entregador}. Seu pedido da {empresa} chegou e aguarda retirada.",
  },
  {
    title: "Estou no Endereço",
    template:
      "Olá {nome}, sou {entregador}. Estou no seu endereço com a encomenda da {empresa}.",
  },
];

// --- INICIALIZAÇÃO ---
window.onload = () => {
  definirDDDPadrao();
  carregarDadosIniciais();
  carregarEntregadorSalvo();
  adicionarEventListeners();
  atualizarPreviewMensagem();
};

function definirDDDPadrao() {
  document.getElementById("ddd").value = DDD_PADRAO;
}

function carregarDadosIniciais() {
  const selEmpresa = document.getElementById("empresa");
  selEmpresa.innerHTML = "";
  EMPRESAS_PADRAO.forEach((emp) => selEmpresa.add(new Option(emp, emp)));

  const selMensagem = document.getElementById("mensagem");
  selMensagem.innerHTML = "";
  // ALTERADO: Agora usa 'msg.title' para o texto e 'msg.template' para o valor
  MENSAGENS_PADRAO.forEach((msg) =>
    selMensagem.add(new Option(msg.title, msg.template)),
  );
}

function carregarEntregadorSalvo() {
  const nome = localStorage.getItem(STORAGE_KEY_ENTREGADOR);
  if (nome) {
    document.getElementById("entregador").value = nome;
  }
}

function atualizarPreviewMensagem() {
  const template = document.getElementById("mensagem").value;
  const textoFormatado = formatarTextoFinal(template);
  document.getElementById("messagePreview").textContent = textoFormatado;
}

function adicionarEventListeners() {
  // Lista de IDs dos campos que afetam o preview
  document
    .getElementById("codigo")
    .addEventListener("input", preencherDadosCliente);
  document
    .getElementById("codigo")
    .addEventListener("blur", verificarConflitoBlur);

  const campos = ["entregador", "empresa", "codigo", "nome", "mensagem"];

  campos.forEach((id) => {
    // 'change' para o select, 'input' para os outros
    const evento = id === "mensagem" || id === "empresa" ? "change" : "input";
    document
      .getElementById(id)
      .addEventListener(evento, atualizarPreviewMensagem);
  });

  // Event listeners que não afetam o preview diretamente
  document
    .getElementById("numero")
    .addEventListener("input", (e) => aplicarMascaraTelefone(e.target));
  document.getElementById("entregador").addEventListener("blur", (e) => {
    localStorage.setItem(STORAGE_KEY_ENTREGADOR, e.target.value.trim());
  });
}

function aplicarMascaraTelefone(elemento) {
  let valor = elemento.value.replace(/\D/g, "");
  valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
  elemento.value = valor.substring(0, 10);
}

function preencherDadosCliente(e) {
  const inputValRaw = e.target.value.trim();
  const codigoInput = document.getElementById("codigo");

  // Remove o alerta vermelho assim que o usuário volta a digitar
  codigoInput.classList.remove("conflito-codigo");

  if (inputValRaw.length === 0) {
    document.getElementById("nome").value = "";
    document.getElementById("numero").value = "";
    atualizarPreviewMensagem();
    return;
  }

  const inputPadronizado = padronizarCodigo(inputValRaw);
  const clientes = JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTES)) || {};
  const chaves = Object.keys(clientes);

  // Busca chaves que terminam com o valor digitado (ex: digitou "10" -> "010", acha "Y-010")
  const matches = chaves.filter((k) => k.endsWith(inputPadronizado));

  if (matches.length === 1) {
    // Sucesso: Achou apenas 1. Auto-preenche!
    document.getElementById("nome").value = clientes[matches[0]].nome;
    const numeroInput = document.getElementById("numero");
    numeroInput.value = clientes[matches[0]].tel;
    aplicarMascaraTelefone(numeroInput);
  } else {
    // Conflito ou Novo: Apenas limpa e aguarda.
    document.getElementById("nome").value = "";
    document.getElementById("numero").value = "";
  }
  atualizarPreviewMensagem();
}

// --- LÓGICA DE DADOS DO CLIENTE ---
// function preencherDadosCliente(e) {
//   const codigo = e.target.value.toUpperCase();
//   const clientes = JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTES)) || {};

//   if (codigo.length === 0) {
//     document.getElementById("nome").value = "";
//     document.getElementById("numero").value = "";
//     atualizarPreviewMensagem();
//     return;
//   }

//   const cliente = clientes[codigo];

//   if (cliente) {
//     document.getElementById("nome").value = cliente.nome;
//     const numeroInput = document.getElementById("numero");
//     numeroInput.value = cliente.tel;
//     aplicarMascaraTelefone(numeroInput);
//   }
//   // else {
//   //   document.getElementById("nome").value = "";
//   //   document.getElementById("numero").value = "";
//   // }
//   atualizarPreviewMensagem();
// }

function salvarDadosCliente() {
    // Pega o código e força a padronização antes de salvar
    const codigoRaw = document.getElementById("codigo").value.trim();
    const codigo = padronizarCodigo(codigoRaw);
    
    const nome = document.getElementById("nome").value.trim();
    const tel = document.getElementById("numero").value.replace(/\D/g, "");

    if (codigo && nome && tel.length >= 8) {
        const clientes = JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTES)) || {};
        clientes[codigo] = { nome, tel };
        localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes));
    }
}
// function salvarDadosCliente() {
//   const codigo = document.getElementById("codigo").value.toUpperCase().trim();
//   const nome = document.getElementById("nome").value.trim();
//   const tel = document.getElementById("numero").value.replace(/\D/g, "");

//   if (codigo && nome && tel.length >= 8) {
//     const clientes =
//       JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTES)) || {};
//     clientes[codigo] = { nome, tel };
//     localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes));
//   }
// }

function formatarTextoFinal(template) {
  const nome = document.getElementById("nome").value.trim() || "Cliente";
  const empresa = document.getElementById("empresa").value;
  const codigo =
    document.getElementById("codigo").value.trim().toUpperCase() || "(sem cód)";
  const entregador =
    document.getElementById("entregador").value.trim() || "o entregador(a)";

  return template
    .replace(/{nome}/g, nome)
    .replace(/{empresa}/g, empresa)
    .replace(/{codigo}/g, codigo)
    .replace(/{entregador}/g, entregador);
}

function verificarConflitoBlur(e) {
    const inputValRaw = e.target.value.trim();
    if (inputValRaw.length === 0) return;

    // Atualiza o visual do input com os zeros à esquerda (ex: 10 vira 010)
    const inputPadronizado = padronizarCodigo(inputValRaw);
    e.target.value = inputPadronizado;

    const clientes = JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTES)) || {};
    const chaves = Object.keys(clientes);
    const matches = chaves.filter(k => k.endsWith(inputPadronizado));

    if (matches.length > 1) {
        // Alerta Elegante: Falso positivo encontrado! Fica com borda vermelha.
        e.target.classList.add("conflito-codigo");
    } else if (matches.length === 1) {
        // Se ele digitou só "010" e só existe "Y-010", ele corrige a letra automaticamente
        e.target.value = matches[0];
    }
}
// --- AÇÃO PRINCIPAL ---
function enviarWhatsApp() {
  const ddd = document.getElementById("ddd").value.replace(/\D/g, "");
  const numero = document.getElementById("numero").value.replace(/\D/g, "");
  const nome = document.getElementById("nome").value.trim();
  const codigo = document.getElementById("codigo").value.trim();
  const entregador = document.getElementById("entregador").value.trim();

  // Validação
  if (!entregador) {
    alert("Por favor, preencha o seu nome de entregador.");
    return;
  }
  if (!codigo || !nome || ddd.length !== 2 || numero.length < 8) {
    alert(
      "Preencha todos os dados do destinatário: Código, Nome, DDD e Telefone válidos.",
    );
    return;
  }

  salvarDadosCliente();

  const templateMensagem = document.getElementById("mensagem").value;
  const textoFinal = formatarTextoFinal(templateMensagem);
  const telefone = "55" + ddd + numero;
  const link = `https://wa.me/${telefone}?text=${encodeURIComponent(textoFinal)}`;

  window.open(link, "_blank");

  // Limpeza para a próxima entrega
  ["codigo", "nome", "numero"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
  document.getElementById("mensagem").selectedIndex = 0;
}

function limparHistoricoClientes() {
  if (
    confirm(
      "Tem certeza que deseja apagar todo o histórico de destinatários? Esta ação não pode ser desfeita.",
    )
  ) {
    localStorage.removeItem(STORAGE_KEY_CLIENTES);
    // Limpa os campos na tela para refletir a exclusão
    ["codigo", "nome", "numero"].forEach(
      (id) => (document.getElementById(id).value = ""),
    );
    alert("Histórico de clientes apagado com sucesso!");
  }
}

function padronizarCodigo(codigo) {
  if (!codigo) return "";
  return codigo.toUpperCase().replace(/\d+/, (match) => match.padStart(3, "0"));
}
