// Função para alternar a visibilidade de uma seção e recalcular a contagem ao alternar para "Hide"
function toggleSection(buttonId, sectionId, calculateTotalFunc) {
    const button = document.getElementById(buttonId);
    const section = document.getElementById(sectionId);

    button.addEventListener('click', () => {
        if (section.classList.contains('hidden')) {
            // Quando mostrar a seção, mantém o texto "Hide"
            section.classList.remove('hidden');
            button.textContent = `Hide ${button.textContent.split(' ')[1]}`;
        } else {
            // Quando esconder a seção, recalcula a contagem
            section.classList.add('hidden');
            const totalCount = calculateTotalFunc();  // Função que calcula o total atual
            button.textContent = `Show ${button.textContent.split(' ')[1]} (${totalCount})`;
        }
    });
}

// Função para exibir domínios de terceiros e atualizar o botão com a contagem correta
function displayThirdPartyDomains(domains) {
    const list = document.getElementById('third-party-domains');
    list.innerHTML = '';  // Limpa a lista antes de adicionar novos itens

    domains.forEach(domain => {
        const li = document.createElement('li');
        li.textContent = domain;
        list.appendChild(li);
    });

    const totalCount = domains.length;
    document.getElementById('toggle-third-party-domains').textContent = `Show Third-Party Domains (${totalCount})`;

    // Chama o toggleSection com uma função que retorna a contagem de domínios
    toggleSection('toggle-third-party-domains', 'third-party-domains', () => totalCount);
}

// Função para exibir informações de cookies e atualizar o botão com a contagem correta
function displayCookiesInfo(cookieData) {
    const list = document.getElementById('cookies-info');
    let totalCookies = 0;
    list.innerHTML = '';  // Limpa a lista antes de adicionar novos itens

    // Para cada categoria de cookie, adiciona a quantidade ao total
    for (const [category, count] of Object.entries(cookieData)) {
        const li = document.createElement('li');
        li.textContent = `${category}: ${count}`;
        list.appendChild(li);
        totalCookies += count;  // Adiciona o número de cookies ao total
    }

    // Atualiza o texto do botão com a quantidade total de cookies
    document.getElementById('toggle-cookies-info').textContent = `Show Cookies (${totalCookies})`;

    // Chama o toggleSection com uma função que retorna a contagem de cookies
    toggleSection('toggle-cookies-info', 'cookies-info', () => totalCookies);
}

// Função para exibir localStorage e atualizar o botão com a contagem correta
function displayLocalStorage(localStorageData) {
    const list = document.getElementById('local-storage-info');
    list.innerHTML = '';  // Limpa a lista antes de adicionar novos itens

    const totalItems = Object.keys(localStorageData).length;

    for (const [key, value] of Object.entries(localStorageData)) {
        const li = document.createElement('li');
        li.textContent = `${key}: ${value}`;
        list.appendChild(li);
    }

    document.getElementById('toggle-local-storage').textContent = `Show Local Storage (${totalItems})`;

    // Chama o toggleSection com uma função que retorna a contagem de itens do localStorage
    toggleSection('toggle-local-storage', 'local-storage-info', () => totalItems);
}

// Função para exibir sessionStorage e atualizar o botão com a contagem correta
function displaySessionStorage(sessionStorageData) {
    const list = document.getElementById('session-storage-info');
    list.innerHTML = '';  // Limpa a lista antes de adicionar novos itens

    const totalItems = Object.keys(sessionStorageData).length;

    for (const [key, value] of Object.entries(sessionStorageData)) {
        const li = document.createElement('li');
        li.textContent = `${key}: ${value}`;
        list.appendChild(li);
    }

    document.getElementById('toggle-session-storage').textContent = `Show Session Storage (${totalItems})`;

    // Chama o toggleSection com uma função que retorna a contagem de itens do sessionStorage
    toggleSection('toggle-session-storage', 'session-storage-info', () => totalItems);
}

// Função para exibir possíveis ameaças detectadas no popup e atualizar o botão com a contagem de ameaças
function displayThreats(threats) {
    const list = document.getElementById('threat-info');
    list.innerHTML = '';  // Limpa a lista antes de adicionar novos itens

    threats.forEach((threat) => {
        const li = document.createElement('li');
        li.textContent = threat;
        list.appendChild(li);
    });

    const totalThreats = threats.length;
    document.getElementById('toggle-threats').textContent = `Show Threats (${totalThreats})`;

    // Chama o toggleSection com uma função que retorna a contagem de ameaças
    toggleSection('toggle-threats', 'threat-info', () => totalThreats);
}

// Quando o popup é aberto, busca os dados do background
browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tab = tabs[0];

    // Detecta possíveis ameaças
    browser.runtime.sendMessage({ action: "detectThreats", tabId: tab.id }).then((threats) => {
        displayThreats(threats);
    });

    // Outras funções para exibir domínios, cookies, localStorage e sessionStorage
    browser.runtime.sendMessage({ action: "getThirdPartyDomains", tabId: tab.id }).then((domains) => {
        displayThirdPartyDomains(domains);
    });

    browser.runtime.sendMessage({ action: "categorizeCookiesAndSupercookies", tabId: tab.id, tabUrl: tab.url }).then((cookieData) => {
        displayCookiesInfo(cookieData);
    });

    browser.runtime.sendMessage({ action: "getLocalStorage", tabId: tab.id }).then((localStorageData) => {
        displayLocalStorage(localStorageData);
    });

    browser.runtime.sendMessage({ action: "getSessionStorage", tabId: tab.id }).then((sessionStorageData) => {
        displaySessionStorage(sessionStorageData);
    });
});




// Função para calcular a pontuação de privacidade
function calculatePrivacyScore(domains, cookies, localStorageData, sessionStorageData, threats) {
    let score = 10;  // Pontuação inicial

    // Se houver ameaças, a pontuação cai para 0
    if (threats.length > 0) {
        return 0;
    }

    // Redução com base nas conexões de terceiros
    const thirdPartyConnections = domains.length;
    score -= thirdPartyConnections * 0.2;  // Cada conexão de terceiro reduz 0,2
    score = Math.max(score, 0);  // Certifica que a pontuação não seja negativa

    // Redução com base nos cookies
    let firstPartyCookies = 0;
    let thirdPartyCookies = 0;

    for (const [category, count] of Object.entries(cookies)) {
        if (category.includes('firstParty')) {
            firstPartyCookies += count;
        } else if (category.includes('thirdParty')) {
            thirdPartyCookies += count;
        }
    }

    // Reduz a pontuação com base nos cookies
    score -= thirdPartyCookies * 0.5;  // Cada cookie de terceiro reduz 0,5
    score -= firstPartyCookies * 0.1;  // Cada cookie de primeira parte reduz 0,2
    // score = Math.max(score, 0);  // Certifica que a pontuação não seja negativa

    // Redução com base no localStorage
    if (Object.keys(localStorageData).length > 0) {
        score -= 1;
    }

    // Redução com base no sessionStorage
    if (Object.keys(sessionStorageData).length > 0) {
        score -= 1;
    }

    // Garantir que a pontuação não seja negativa
    return Math.max(score, 0);
}

// Função para exibir a pontuação de privacidade no popup
function displayPrivacyScore(domains, cookies, localStorageData, sessionStorageData, threats) {
    const score = calculatePrivacyScore(domains, cookies, localStorageData, sessionStorageData, threats);
    
    const scoreElement = document.getElementById('privacy-score');
    scoreElement.textContent = `Privacy Score: ${score.toFixed(1)}/10`;  // Exibe a pontuação na div criada com uma casa decimal
}

// Quando o popup é aberto, busca os dados do background e calcula a pontuação
browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tab = tabs[0];

    Promise.all([
        browser.runtime.sendMessage({ action: "getThirdPartyDomains", tabId: tab.id }),
        browser.runtime.sendMessage({ action: "categorizeCookiesAndSupercookies", tabId: tab.id, tabUrl: tab.url }),
        browser.runtime.sendMessage({ action: "getLocalStorage", tabId: tab.id }),
        browser.runtime.sendMessage({ action: "getSessionStorage", tabId: tab.id }),
        browser.runtime.sendMessage({ action: "detectThreats", tabId: tab.id })  // Adiciona a detecção de ameaças aqui
    ]).then(([domains, cookies, localStorageData, sessionStorageData, threats]) => {
        displayPrivacyScore(domains, cookies, localStorageData, sessionStorageData, threats);
    });
});
