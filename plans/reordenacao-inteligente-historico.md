# Plano 3: Rastreamento e Reordenação Inteligente de Mensagens Enviadas

## Objetivo
Mapear quais mensagens já foram enviadas para um determinado cliente (código de pacote) e reordenar dinamicamente o `<select>` de mensagens, jogando as enviadas para o final da lista e selecionando automaticamente a próxima lógica.

## Contexto para o Agente Codificador
- **Estado atual:** A função `salvarDadosCliente()` já salva um array `msgEnviadas` no objeto do cliente, mas ele está sempre sobrescrevendo (ex: `[msgSelId]`).
- **Stack:** Vanilla JS, manipulação de arrays e opções do DOM.

## Passos de Implementação
1. **Melhorar o Rastreamento (`salvarDadosCliente`):**
   - Ao enviar uma mensagem, verificar se o cliente já existe no `localStorage`.
   - Se já existir, fazer o `.push()` do novo `msgSelId` no array `msgEnviadas` existente, garantindo que não haja duplicatas (usar `Set` ou `.includes()`).

2. **Criar função de Reordenação (`reordenarSelectMensagens(clienteId)`):**
   - Obter o cliente atual do `localStorage` a partir da junção da `letra` e `codigo`.
   - Se o cliente existir e possuir o array `msgEnviadas`:
     - Pegar todas as mensagens base (`zapApp_mensagens`).
     - Dividir em duas listas: `pendentes` (ID não está em `msgEnviadas`) e `enviadas` (ID está em `msgEnviadas`).
     - Alterar o texto das opções enviadas para algo como: `✅ [Enviada] Nome da Mensagem`.
     - Limpar o `<select>` atual.
     - Fazer um append primeiro das mensagens `pendentes`, e depois das `enviadas`.
     - Definir `select.selectedIndex = 0` (o que fará com que a primeira "pendente" seja automaticamente selecionada).
   - Se o cliente **não** existir (pacote novo), montar o select na ordem padrão (1, 2, 3, 4).

3. **Gatilhos de Execução:**
   - Esta reordenação deve ser disparada de dentro da função `preencherDadosCliente(cliente)` (quando o usuário digita um código que já existe) e redefinida na função `limpaFormDestinatario()`.
   - Lembre-se de disparar `atualizarPreviewMensagem()` sempre que a opção do select for reordenada/alterada por código.