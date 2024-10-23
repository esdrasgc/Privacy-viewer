// Função para alternar a visibilidade de uma seção e atualizar o botão com a quantidade
function toggleSection(buttonId, sectionId) {
    const button = document.getElementById(buttonId);
    const section = document.getElementById(sectionId);

    button.addEventListener('click', () => {
        if (section.classList.contains('hidden')) {
            section.classList.remove('hidden');
            button.textContent = `Hide ${button.textContent.split(' ')[1]} (${section.children.length})`;  // Altera o texto do botão com a quantidade
        } else {
            section.classList.add('hidden');
            button.textContent = `Show ${button.textContent.split(' ')[1]} (${section.children.length})`;
        }
    });
}

// Função para exibir domínios de terceiros no popup e atualizar o botão com a quantidade
function displayThirdPartyDomains(domains) {
    const list = document.getElementById('third-party-domains');
    domains.forEach(domain => {
        const li = document.createElement('li');
        li.textContent = domain;
        list.appendChild(li);
    });
    // Atualiza o texto do botão com a quantidade de domínios
    document.getElementById('toggle-third-party-domains').textContent = `Show Third-Party Domains (${domains.length})`;
}

// Função para exibir informações de cookies e supercookies no popup e atualizar o botão com a soma correta
function displayCookiesInfo(cookieData) {
    const list = document.getElementById('cookies-info');
    let totalCookies = 0;
    // Limpa a lista antes de adicionar novos elementos
    list.innerHTML = ''; 

    // Para cada categoria de cookie, adiciona a quantidade ao total
    for (const [category, count] of Object.entries(cookieData)) {
        const li = document.createElement('li');
        li.textContent = `${category}: ${count}`;
        list.appendChild(li);
        totalCookies += count;  // Adiciona o número de cookies ao total
    }

    // Atualiza o texto do botão com a quantidade total de cookies
    document.getElementById('toggle-cookies-info').textContent = `Show Cookies (${totalCookies})`;
}


// Função para exibir localStorage no popup e atualizar o botão com a quantidade
function displayLocalStorage(localStorageData) {
    const list = document.getElementById('local-storage-info');
    const totalItems = Object.keys(localStorageData).length;
    for (const [key, value] of Object.entries(localStorageData)) {
        const li = document.createElement('li');
        li.textContent = `${key}: ${value}`;
        list.appendChild(li);
    }
    // Atualiza o texto do botão com a quantidade de itens no localStorage
    document.getElementById('toggle-local-storage').textContent = `Show Local Storage (${totalItems})`;
}

// Função para exibir sessionStorage no popup e atualizar o botão com a quantidade
function displaySessionStorage(sessionStorageData) {
    const list = document.getElementById('session-storage-info');
    const totalItems = Object.keys(sessionStorageData).length;
    for (const [key, value] of Object.entries(sessionStorageData)) {
        const li = document.createElement('li');
        li.textContent = `${key}: ${value}`;
        list.appendChild(li);
    }
    // Atualiza o texto do botão com a quantidade de itens no sessionStorage
    document.getElementById('toggle-session-storage').textContent = `Show Session Storage (${totalItems})`;
}

// Quando o popup é aberto, busca os dados do background
browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tab = tabs[0];

    // Obtém domínios de terceiros
    browser.runtime.sendMessage({ action: "getThirdPartyDomains", tabId: tab.id }).then((domains) => {
        displayThirdPartyDomains(domains);
    });

    // Obtém cookies e supercookies
    browser.runtime.sendMessage({ action: "categorizeCookiesAndSupercookies", tabId: tab.id, tabUrl: tab.url }).then((cookieData) => {
        displayCookiesInfo(cookieData);
    });

    // Obtém localStorage
    browser.runtime.sendMessage({ action: "getLocalStorage", tabId: tab.id }).then((localStorageData) => {
        displayLocalStorage(localStorageData);
    });

    // Obtém sessionStorage
    browser.runtime.sendMessage({ action: "getSessionStorage", tabId: tab.id }).then((sessionStorageData) => {
        displaySessionStorage(sessionStorageData);
    });
});

// Adiciona comportamento de mostrar/ocultar para cada seção
toggleSection('toggle-third-party-domains', 'third-party-domains');
toggleSection('toggle-cookies-info', 'cookies-info');
toggleSection('toggle-local-storage', 'local-storage-info');
toggleSection('toggle-session-storage', 'session-storage-info');
