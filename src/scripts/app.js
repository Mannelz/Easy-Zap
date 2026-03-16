// --- CHAVES DO LOCALSTORAGE ---
const STORAGE_KEY_CLIENTES = "zapApp_clientes_salvos";
const STORAGE_KEY_ENTREGADOR = "zapApp_nome_entregador"; // Novo
const STORAGE_KEY_LETRA = "zapApp_letra_codigo"; // Novo
const DDD_PADRAO = "31";
const MAX_LEN_NUM_COD = 4;
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
    id: 1,
    title: "Encomenda a Caminho",
    template:
      "Olá {nome}! Sou {entregador}, da {empresa}. Seu pedido está a caminho!",
  },
  {
    id: 2,
    title: "Estou no Endereço",
    template:
      "Olá {nome}, sou {entregador}. Estou no seu endereço com a encomenda da {empresa}.",
  },
  {
    id: 3,
    title: "Pedido Chegou (Aguardando Retirada)",
    template: "Oi {nome}, aqui é {entregador}. Seu pedido da {empresa} chegou.",
  },
  {
    id: 4,
    title: "Niguem em Casa (Retornar)",
    template:
      "{nome}, aqui é {entregador}.Não encontramos ninguém no endereço, devo permanecer no bairro pela proxima hora.",
  },
];

// --- INICIALIZAÇÃO ---
window.onload = () => {
  carregarDadosIniciais();
  definirDDDPadrao();
  carregarEntregadorSalvo();
  adicionarEventListeners();
  atualizarPreviewMensagem();
};

function adicionarEventListeners() {
  // Lista de IDs dos campos que afetam o preview
  document.getElementById("letras").addEventListener("input", onCodigoChange);
  document.getElementById("codigo").addEventListener("input", onCodigoChange);
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

  document
    .getElementById("nome")
    .addEventListener("blur", ajustaNomeCliente);

  document.getElementById("entregador").addEventListener("blur", (e) => {
    localStorage.setItem(STORAGE_KEY_ENTREGADOR, e.target.value.trim());
  });
}

function ajustaNomeCliente(e) {
    let entrada = e.target.value;
    if (entrada == "") return;
    if(entrada.replace(/[^a-z,A-Z,\s]/g, "").length < 2 ){
      e.target.value = ""
      return
    }
    e.target.value = entrada.split(/\s/).map(capitalizeFirstLetter).join(" ");
    atualizarPreviewMensagem()
}

function capitalizeFirstLetter(string) {
  if (string.length === 0) {
    return string; // Handle empty strings
  }
  return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
}


function carregarDadosIniciais() {

  const selEmpresa = document.getElementById("empresa");
  selEmpresa.innerHTML = "";
  EMPRESAS_PADRAO.forEach((emp) => selEmpresa.add(new Option(emp, emp)));

  const selMensagem = document.getElementById("mensagem");
  selMensagem.innerHTML = "";
  // ALTERADO: Agora usa 'msg.title' para o texto e 'msg.template' para o valor
  MENSAGENS_PADRAO.forEach((msg) =>
    selMensagem.add(new Option(msg.title, msg.id)),
  );
}

function definirDDDPadrao() {
  document.getElementById("ddd").value = DDD_PADRAO;
}

function carregarEntregadorSalvo() {
  const nome = localStorage.getItem(STORAGE_KEY_ENTREGADOR);
  if (nome) {
    document.getElementById("entregador").value = nome;
  }
}

function carregarLetrasSalvo() {
  const nome = localStorage.getItem(STORAGE_KEY_LETRA);
  if (nome) {
    document.getElementById("letras").value = nome;
  }
}

function aplicarMascaraTelefone(elemento) {
  let valor = elemento.value.replace(/\D/g, "");
  valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
  elemento.value = valor.substring(0, 10);
}

function onCodigoChange(e) {
  limpaAlertaCodigoDuplicado();
  formataCodigo(e);
  let cliente = buscarCliente();
  if (!cliente) return;
  preencherDadosCliente(cliente);
}

function formataCodigo(e) {
  const inputValRaw = e.target?.value.trim();
  e.target.value = "";
  if (inputValRaw.length === 0) return;

  if (e.target.id === "codigo") {
    let pre = inputValRaw.replace(/\D+/g, "").replace(/^[0]+/g, "");

    if (pre.length > MAX_LEN_NUM_COD) {
      e.target.value = pre.slice(0, MAX_LEN_NUM_COD);
      return;
    }
    e.target.value = pre.padStart(MAX_LEN_NUM_COD, "0").slice(-MAX_LEN_NUM_COD);
  }
  if (e.target.id === "letras") {
    e.target.value = inputValRaw.toUpperCase().replace(/\d+|\W+/g, "");
  }
}

function buscarCliente() {
  limpaAlertaCodigoDuplicado();
  limpaFormDestinatario();
  const codigoCompleto = padronizarCodigo();
  if (codigoCompleto == "") return;

  const clientes = JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTES)) || {};
  const chaves = Object.keys(clientes);
  const matches = chaves.filter((k) => k.endsWith(codigoCompleto));

  if (matches.length === 0) return null;

  if (matches.length > 1) {
    alertaConflitoCodigp();
    return null;
  }
  return clientes[matches[0]];
}

function preencherDadosCliente(cliente) {
  if (!cliente) return;
  document.getElementById("nome").value = cliente.nome;
  const numeroInput = document.getElementById("numero");
  numeroInput.value = cliente.tel;
  aplicarMascaraTelefone(numeroInput);
  atualizarPreviewMensagem();
}

function atualizarPreviewMensagem() {
  let template = msgSelecionada();
  const textoFormatado = formatarTextoFinal(template);
  document.getElementById("messagePreview").textContent = textoFormatado;
}

function msgSelecionada() {
  const msgSelId = document.getElementById("mensagem").value;
  let template = MENSAGENS_PADRAO.find(m => m.id == msgSelId)?.template;
  return template;
}

function limpaAlertaCodigoDuplicado() {
  const codigoInput = document.getElementById("codigo");
  codigoInput.classList.remove("conflito-codigo");
  //el.classList.remove("conflito-codigo");
  const erro = document.getElementById("erro-codigo");
  erro.textContent = "";
}

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

// --- AÇÃO PRINCIPAL ---
function enviarWhatsApp() {
  const ddd = document.getElementById("ddd").value.replace(/\D/g, "");
  const numero = document.getElementById("numero").value.replace(/\D/g, "");
  const nome = document.getElementById("nome").value.trim();
  const codigo = padronizarCodigo();
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

  const templateMensagem = msgSelecionada();
  const textoFinal = formatarTextoFinal(templateMensagem);
  const telefone = "55" + ddd + numero;
  const link = `https://wa.me/${telefone}?text=${encodeURIComponent(textoFinal)}`;

  window.open(link, "_blank");

  salvarDadosCliente(); 
  limpaFormDestinatario(limparCode=true);
  document.getElementById("mensagem").selectedIndex = 0;
}

function salvarDadosCliente() {
  // Pega o código e força a padronização antes de salvar
  const codigo = padronizarCodigo();

  const nome = document.getElementById("nome").value.trim();
  const tel = document.getElementById("numero").value.replace(/\D/g, "");
  const msgSelId = document.getElementById("mensagem").value;
  let msgEnviadas = [msgSelId];
  
  if (codigo && nome && tel.length >= 8) {
    const clientes =
      JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTES)) || {};
    clientes[codigo] = { nome, tel, msgEnviadas };
    localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes));
  }
}

function limpaFormDestinatario(limparCode = false) {
  let campos = limparCode? ["codigo","nome", "numero"] : ["nome", "numero"];
  campos.forEach(
    (id) => (document.getElementById(id).value = ""),
  );
  atualizarPreviewMensagem();
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

function padronizarCodigo() {
  let codigo = document.getElementById("codigo").value;
  if (!codigo) return "";

  let letra = document.getElementById("letras").value;
  if (!letra || letra.length == 0) {
    alert("Informe a Letra de sua Rota");
    return;
  }
  return `${letra}-${codigo}`;
}

function alertaConflitoCodigp(e) {
  //e.target.classList.add("conflito-codigo");
  // const el = document.getElementById("erro-codigo") //.
  // el.classList.add("error-text")
  // el.textContent = "Múltiplos pacotes. Digite a letra da rota.";
}