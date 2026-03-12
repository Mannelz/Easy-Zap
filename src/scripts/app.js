/* Caminho: ./scripts/app.js */

// --- CHAVES PARA O LOCALSTORAGE ---
const STORAGE_KEY_MSGS = 'zapApp_msgs_salvas';
const STORAGE_KEY_DDD = 'zapApp_ddd_salvo';

// --- MENSAGENS PADRÃO ---
const msgsPadrao =[
    "Olá, o seu pedido já está a caminho!",
    "Olá, o seu pedido chegou ao destino e está te aguardando vir buscar!"
];

// --- INICIALIZAÇÃO AO ABRIR O APP ---
window.onload = () => {
    carregarDDD();
    carregarMensagens();
};

function carregarDDD() {
    const dddSalvo = localStorage.getItem(STORAGE_KEY_DDD);
    if (dddSalvo) {
        document.getElementById('ddd').value = dddSalvo;
    }
}

function carregarMensagens() {
    const select = document.getElementById('mensagem');
    select.innerHTML = ''; // Limpa antes de popular

    // 1. Carrega as opções padrão
    msgsPadrao.forEach(msg => {
        select.add(new Option(msg, msg));
    });

    // 2. Carrega opções salvas no LocalStorage
    let msgsSalvas = JSON.parse(localStorage.getItem(STORAGE_KEY_MSGS)) ||[];
    
    if (msgsSalvas.length > 0) {
        let grupoPersonalizado = document.createElement('optgroup');
        grupoPersonalizado.label = "Minhas Mensagens Salvas";
        
        msgsSalvas.forEach(msg => {
            // Corta o texto se for muito longo para caber bonito no Select
            let textoVisual = msg.length > 45 ? msg.substring(0, 45) + '...' : msg;
            let opt = new Option(textoVisual, msg);
            grupoPersonalizado.appendChild(opt);
        });
        
        select.add(grupoPersonalizado);
    }

    // Exibe ou oculta o botão de limpar com base em existirem mensagens salvas
    let btnLimpar = document.getElementById('btnLimparSalvas');
    if (msgsSalvas.length > 0) {
        btnLimpar.style.display = 'block';
    } else {
        btnLimpar.style.display = 'none';
    }

    // 3. Adiciona a opção de criar nova no final
    select.add(new Option("✍️ Escrever nova mensagem...", "NOVA"));
}

// --- LÓGICA DA TELA: MOSTRAR/OCULTAR CAIXA NOVA MSG ---
document.getElementById('mensagem').addEventListener('change', function() {
    const caixaCustomizada = document.getElementById('caixaCustomizada');
    if (this.value === 'NOVA') {
        caixaCustomizada.style.display = 'block';
        document.getElementById('textoNovaMensagem').focus();
    } else {
        caixaCustomizada.style.display = 'none';
    }
});

// --- MÁSCARA DO TELEFONE DINÂMICA (XXXXX-XXXX) ---
document.getElementById('numero').addEventListener('input', function(e) {
    let valor = e.target.value.replace(/\D/g, ''); 
    if (valor.length > 5) {
        valor = valor.substring(0, 5) + '-' + valor.substring(5, 10);
    }
    e.target.value = valor;
});

// --- FUNÇÃO PARA LIMPAR MENSAGENS PERSONALIZADAS ---
function limparMensagensSalvas() {
    if(confirm("Tem certeza que deseja apagar todas as suas mensagens salvas?")) {
        localStorage.removeItem(STORAGE_KEY_MSGS);
        carregarMensagens();
        document.getElementById('caixaCustomizada').style.display = 'none';
    }
}

// --- AÇÃO PRINCIPAL: BOTÃO ÚNICO ---
function enviarWhatsApp() {
    let ddd = document.getElementById("ddd").value.replace(/\D/g, "");
    let numero = document.getElementById("numero").value.replace(/\D/g, "");
    let selectValue = document.getElementById("mensagem").value;
    let mensagemFinal = "";

    // 1. Validação Simples
    if (ddd.length !== 2) {
        alert("Por favor, digite um DDD válido com 2 números.");
        document.getElementById("ddd").focus();
        return;
    }
    if (numero.length < 8) {
        alert("Por favor, digite um número de telefone válido.");
        document.getElementById("numero").focus();
        return;
    }

    // 2. Salva o DDD para a próxima entrega (persiste no navegador)
    localStorage.setItem(STORAGE_KEY_DDD, ddd);

    // 3. Define a Mensagem e verifica o LocalStorage
    if (selectValue === "NOVA") {
        mensagemFinal = document.getElementById("textoNovaMensagem").value.trim();
        
        if(mensagemFinal === "") {
            alert("Por favor, digite a sua mensagem personalizada.");
            document.getElementById("textoNovaMensagem").focus();
            return;
        }

        // Verifica se o usuário quer salvar essa mensagem nas opções
        let querSalvar = document.getElementById("salvarMensagemCheck").checked;
        if (querSalvar) {
            let msgsSalvas = JSON.parse(localStorage.getItem(STORAGE_KEY_MSGS)) ||[];
            
            // Salva apenas se a mensagem ainda não existir na lista
            if (!msgsSalvas.includes(mensagemFinal)) {
                msgsSalvas.push(mensagemFinal);
                localStorage.setItem(STORAGE_KEY_MSGS, JSON.stringify(msgsSalvas));
                
                // Recarrega o Select para a nova mensagem já aparecer na lista
                carregarMensagens();
            }
        }
    } else {
        // Se escolheu uma das mensagens da lista
        mensagemFinal = selectValue;
    }

    // 4. Monta o Link
    let telefone = "55" + ddd + numero;
    let link = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagemFinal)}`;

    // 5. ABRE O WHATSAPP IMEDIATAMENTE
    window.open(link, '_blank');

    // 6. Limpa os campos para o motorista fazer a próxima entrega rápido
    document.getElementById("numero").value = "";
    document.getElementById("textoNovaMensagem").value = "";
    document.getElementById("mensagem").value = msgsPadrao[0]; // Volta pra 1ª opção
    document.getElementById("caixaCustomizada").style.display = 'none';
}