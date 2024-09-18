function formatarNumero(numero) {
    // Remove o sinal de '+' se estiver presente
    numero = numero.replace('+', '');

    // Remove todos os caracteres que não sejam números
    numero = numero.replace(/\D/g, '');

    // Verifica se o número já tem o DDI 55, caso contrário, adiciona
    if (!numero.startsWith('55')) {
        numero = '55' + numero;
    }

    // Remove o DDI (55) para processar o restante do número
    let numeroFinal = numero.slice(2);

    // Se o número após o DDI tiver menos de 10 dígitos, assume que o DDD está faltando
    if (numeroFinal.length < 10) {
        numeroFinal = '75' + numeroFinal; // Adiciona o DDD '75'
    }
    // }  else if (numeroFinal.length >= 11) {
    //     // Mantém os dois primeiros dígitos após o DDI e os últimos 8 dígitos
    //     numeroFinal = numeroFinal.slice(0, 2) + numeroFinal.slice(-8);
    // }

    // Retorna o número completo com DDI
    return '55' + numeroFinal;
}


module.exports = formatarNumero


