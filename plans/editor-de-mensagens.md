# Plano 2: Componente de Edição de Mensagens

## Objetivo
Criar uma interface para que o usuário final (entregador) possa editar os textos das mensagens padrão e salvar essas alterações localmente, sem precisar alterar o código-fonte.

## Contexto para o Agente Codificador
- **Stack:** Vanilla JS, manipulação de DOM.
- **Padrão:** Inserir um botão "⚙️ Editar" (ou similar) ao lado do label ou select de "Mensagem Padrão". 
- **Componentização:** Utilizar a tag `<dialog>` nativa do HTML5 para o modal, controlada via JS.

## Passos de Implementação
1. **Criar a Interface (UI):**
   - Adicionar o botão de edição no `index.html`.
   - Adicionar uma tag `<dialog id="modal-editor">` no final do `<body>` do `index.html` (ou criá-la dinamicamente via JS). O modal deve conter:
     - Um formulário gerado dinamicamente com `<textarea>` para cada template de mensagem existente.
     - Botões "Cancelar" e "Salvar".

2. **Lógica do Componente (`app.js` ou novo arquivo `EditorMensagens.js`):**
   - Criar função para `abrirEditor()`:
     - Ler o array de `zapApp_mensagens` do `localStorage`.
     - Limpar o interior do modal e renderizar um `<label>` (título) e um `<textarea>` (template) para cada item do array.
     - Chamar `modal.showModal()`.
   - Criar função para `fecharEditor()` (chama `modal.close()`).
   - Criar função `salvarEdicao()`:
     - Capturar os novos valores dos `<textarea>`.
     - Atualizar o array de objetos.
     - Sobrescrever a chave `zapApp_mensagens` no `localStorage`.
     - Fechar o modal e chamar `carregarDadosIniciais()` e `atualizarPreviewMensagem()` para refletir a mudança instantaneamente na tela principal.