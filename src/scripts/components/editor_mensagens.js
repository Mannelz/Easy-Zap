// --- EDITOR DE MENSAGENS ---
// Depende de `mensagensPadrao` e `STORAGE_KEY_MENSAGENS` definidos em app.js
let editorMode = "edit"; // 'edit' ou 'add'

function abrirEditorMensagens() {
  const modal = document.getElementById("modal-editor");
  const seletor = document.getElementById("modal-mensagem-seletor");
  const titulo = document.getElementById("modal-mensagem-titulo");
  const textarea = document.getElementById("modal-mensagem-template");
  const toggleBtn = document.getElementById("btn-toggle-add-edit");
  if (!modal || !seletor || !titulo || !textarea || !toggleBtn) return;

  atualizarOpcoesModal();
  atualizarPlaceholderButtons();
  setEditorMode("edit");

  if (mensagensPadrao.length > 0) {
    seletor.value = mensagensPadrao[0].id;
    titulo.value = mensagensPadrao[0].title;
    textarea.value = mensagensPadrao[0].template;
  } else {
    titulo.value = "";
    textarea.value = "";
  }

  seletor.removeEventListener("change", carregarConteudoSelecionado);
  seletor.addEventListener("change", carregarConteudoSelecionado);

  modal.showModal();
}

function setEditorMode(mode) {
  const seletorGroup = document.getElementById("modal-seletor-group");
  const tituloGroup = document.getElementById("modal-titulo-group");
  const toggleBtn = document.getElementById("btn-toggle-add-edit");
  const seletor = document.getElementById("modal-mensagem-seletor");
  const titulo = document.getElementById("modal-mensagem-titulo");
  const textarea = document.getElementById("modal-mensagem-template");

  if (!seletorGroup || !tituloGroup || !toggleBtn || !seletor || !titulo || !textarea) return;

  editorMode = mode;

  if (mode === "edit") {
    seletorGroup.style.display = "block";
    tituloGroup.style.display = "block";
    toggleBtn.textContent =  "+";
    toggleBtn.title = "Mudar para adicionar nova mensagem";

    if (mensagensPadrao.length > 0) {
      const selecionado = mensagensPadrao.find((m) => String(m.id) === String(seletor.value)) || mensagensPadrao[0];
      seletor.value = selecionado.id;
      titulo.value = selecionado.title;
      textarea.value = selecionado.template;
    } else {
      titulo.value = "";
      textarea.value = "";
    }
  } else {
    seletorGroup.style.display = "none";
    tituloGroup.style.display = "block";
    toggleBtn.textContent = "✎";
    toggleBtn.title = "Mudar para editar mensagem existente";

    const proximoId = String(mensagensPadrao.reduce((anterior, atual) => Math.max(anterior, Number(atual.id)), 0) + 1);
    titulo.value = "";
    textarea.value = "";

    // armazenar id para novo registro no save
    titulo.dataset.novoId = proximoId;
  }
}

function toggleModalMode() {
  if (editorMode === "edit") {
    setEditorMode("add");
  } else {
    setEditorMode("edit");
  }
}

function carregarConteudoSelecionado() {
  const seletor = document.getElementById("modal-mensagem-seletor");
  const titulo = document.getElementById("modal-mensagem-titulo");
  const textarea = document.getElementById("modal-mensagem-template");
  if (!seletor || !titulo || !textarea) return;

  const selecionado = mensagensPadrao.find((m) => String(m.id) === String(seletor.value));
  if (!selecionado) return;

  titulo.value = selecionado.title;
  textarea.value = selecionado.template;
}

function atualizarOpcoesModal() {
  const seletor = document.getElementById("modal-mensagem-seletor");
  if (!seletor) return;

  seletor.innerHTML = "";
  mensagensPadrao.forEach((msg) => {
    const opt = document.createElement("option");
    opt.value = msg.id;
    opt.textContent = `${msg.id}. ${msg.title}`;
    seletor.appendChild(opt);
  });
}

function fecharEditorMensagens() {
  const modal = document.getElementById("modal-editor");
  if (!modal) return;
  modal.close();
}

function salvarEditorMensagens() {
  const seletor = document.getElementById("modal-mensagem-seletor");
  const titulo = document.getElementById("modal-mensagem-titulo");
  const textarea = document.getElementById("modal-mensagem-template");

  if (!titulo || !textarea) return;

  const texto = textarea.value.trim();
  const title = titulo.value.trim() || `Mensagem ${titulo.dataset.novoId || ""}`;
  if (!texto || !title) {
    alert("Preencha título e texto da mensagem.");
    return;
  }

  if (editorMode === "add") {
    const novoId = Number(titulo.dataset.novoId || 0);
    if (!novoId) return;
    const novoItem = { id: novoId, title, template: texto };
    mensagensPadrao.push(novoItem);
  } else {
    if (!seletor) return;
    const idSelecionado = seletor.value;
    const msgIndex = mensagensPadrao.findIndex((m) => String(m.id) === String(idSelecionado));
    if (msgIndex === -1) return;
    mensagensPadrao[msgIndex].title = title;
    mensagensPadrao[msgIndex].template = texto;
  }

  localStorage.setItem(STORAGE_KEY_MENSAGENS, JSON.stringify(mensagensPadrao));
  atualizarOpcoesModal();
  carregarDadosIniciais();
  atualizarPreviewMensagem();
  fecharEditorMensagens();
}

function excluirMensagemSelecionada() {
  if (editorMode !== "edit") return;
  const seletor = document.getElementById("modal-mensagem-seletor");
  if (!seletor) return;

  const idSelecionado = seletor.value;
  const msgIndex = mensagensPadrao.findIndex((m) => String(m.id) === String(idSelecionado));
  if (msgIndex === -1) return;

  if (!confirm("Deseja realmente excluir esta mensagem?")) return;

  mensagensPadrao.splice(msgIndex, 1);
  localStorage.setItem(STORAGE_KEY_MENSAGENS, JSON.stringify(mensagensPadrao));
  atualizarOpcoesModal();
  if (mensagensPadrao.length > 0) {
    seletor.value = mensagensPadrao[0].id;
    carregarConteudoSelecionado();
  } else {
    document.getElementById("modal-mensagem-titulo").value = "";
    document.getElementById("modal-mensagem-template").value = "";
  }
  carregarDadosIniciais();
  atualizarPreviewMensagem();
}

function limparMensagensPersonalizadas() {
  if (!confirm("Deseja limpar mensagens personalizadas e voltar às mensagens do sistema?")) return;
  localStorage.removeItem(STORAGE_KEY_MENSAGENS);
  if (typeof restaurarMensagensPadrao === "function") {
    restaurarMensagensPadrao();
  }
  fecharEditorMensagens();
}

function recarregarMensagensPadrao() {
  if (!confirm("Deseja recarregar as mensagens padrão do arquivo JSON?")) return;
  localStorage.removeItem(STORAGE_KEY_MENSAGENS);
  if (typeof restaurarMensagensPadrao === "function") {
    restaurarMensagensPadrao();
  }
  fecharEditorMensagens();
}

function atualizarPlaceholderButtons() {
  const container = document.getElementById("placeholder-buttons");
  const textarea = document.getElementById("modal-mensagem-template");
  if (!container || !textarea) return;

  container.innerHTML = "";
  const placeholders = ["{nome}", "{empresa}", "{entregador}"];

  placeholders.forEach((ph) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = ph;
    btn.className = "placeholder-button";
    btn.addEventListener("click", () => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.slice(0, start) + ph + textarea.value.slice(end);
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + ph.length;
    });
    container.appendChild(btn);
  });
}

