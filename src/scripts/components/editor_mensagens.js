// --- EDITOR DE MENSAGENS ---
// Depende de `mensagensPadrao` e `STORAGE_KEY_MENSAGENS` definidos em app.js

function abrirEditorMensagens() {
  const modal = document.getElementById("modal-editor");
  const seletor = document.getElementById("modal-mensagem-seletor");
  const textarea = document.getElementById("modal-mensagem-template");
  if (!modal || !seletor || !textarea) return;

  seletor.innerHTML = "";
  mensagensPadrao.forEach((msg) => {
    const opt = document.createElement("option");
    opt.value = msg.id;
    opt.textContent = msg.title;
    seletor.appendChild(opt);
  });

  if (mensagensPadrao.length > 0) {
    seletor.value = mensagensPadrao[0].id;
    textarea.value = mensagensPadrao[0].template;
  } else {
    textarea.value = "";
  }

  seletor.addEventListener("change", () => atualizarTemplateDoModal());

  modal.showModal();
}

function atualizarTemplateDoModal() {
  const seletor = document.getElementById("modal-mensagem-seletor");
  const textarea = document.getElementById("modal-mensagem-template");
  if (!seletor || !textarea) return;

  const selecionado = mensagensPadrao.find((m) => String(m.id) === String(seletor.value));
  textarea.value = selecionado ? selecionado.template : "";
}

function fecharEditorMensagens() {
  const modal = document.getElementById("modal-editor");
  if (!modal) return;
  modal.close();
}

function salvarEditorMensagens() {
  const seletor = document.getElementById("modal-mensagem-seletor");
  const textarea = document.getElementById("modal-mensagem-template");
  if (!seletor || !textarea) return;

  const idSelecionado = seletor.value;
  const msgIndex = mensagensPadrao.findIndex((m) => String(m.id) === String(idSelecionado));
  if (msgIndex === -1) return;

  mensagensPadrao[msgIndex].template = textarea.value.trim() || mensagensPadrao[msgIndex].template;
  localStorage.setItem(STORAGE_KEY_MENSAGENS, JSON.stringify(mensagensPadrao));
  carregarDadosIniciais();
  atualizarPreviewMensagem();
  fecharEditorMensagens();
}
