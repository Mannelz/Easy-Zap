# Plano 1: Migração de Mensagens Hardcoded para JSON e LocalStorage

## Objetivo
Remover a constante `MENSAGENS_PADRAO` do arquivo `app.js` e passar a consumir esses dados a partir de um arquivo estático JSON (`assets/data/mensagens.json`), utilizando o `localStorage` como cache e fonte da verdade.

## Contexto para o Agente Codificador
- **Stack:** Vanilla JS. Sem bibliotecas.
- **Armazenamento:** Chave sugerida para o `localStorage`: `zapApp_mensagens`.

## Passos de Implementação
1. **Criar o arquivo de dados:**
   - Criar `assets/data/mensagens.json`.
   - Mover o array de objetos que estava na constante `MENSAGENS_PADRAO` para este arquivo JSON.

2. **Criar lógica de Inicialização Assíncrona (`app.js`):**
   - Alterar `window.onload` (ou a função de boot) para ser `async`.
   - Criar uma função `carregarMensagens()`.
   - Lógica da função: Verificar se `localStorage.getItem("zapApp_mensagens")` existe.
     - **Se NÃO existir:** Fazer `fetch('./assets/data/mensagens.json')`, converter para JSON, salvar no `localStorage` via `JSON.stringify()` e retornar o array.
     - **Se existir:** Fazer o `JSON.parse()` do texto do `localStorage` e retornar o array.

3. **Refatoração no `app.js`:**
   - Substituir todas as referências à variável global `MENSAGENS_PADRAO` por chamadas dinâmicas ao array carregado.
   - Atualizar a função `carregarDadosIniciais()` para montar o `<select id="mensagem">` utilizando os dados que vieram do `localStorage`/`fetch`.