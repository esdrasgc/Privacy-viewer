// Função para resgatar os dados do localStorage da página
function getLocalStorageData() {
    let localStorageData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      localStorageData[key] = localStorage.getItem(key);
    }
    return localStorageData;
  }
  
  // Função para resgatar os dados do sessionStorage da página
  function getSessionStorageData() {
    let sessionStorageData = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      sessionStorageData[key] = sessionStorage.getItem(key);
    }
    return sessionStorageData;
  }
  
  // Listener para receber mensagens do background e responder
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getLocalStorage") {
      sendResponse(getLocalStorageData());
    } else if (message.action === "getSessionStorage") {
      sendResponse(getSessionStorageData());
    }
  });












  
// Função auxiliar para detectar supercookies
function detectSupercookies() {
    const supercookies = [];
  
    // Verifica se há supercookies no localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      supercookies.push({
        key: key,
        isThirdParty: true,  // Suponha que supercookies são geralmente de terceiros
        isSession: false      // Supercookies no localStorage são persistentes
      });
    }
  
    // Verifica se há supercookies no sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      supercookies.push({
        key: key,
        isThirdParty: true,   // Suponha que supercookies são geralmente de terceiros
        isSession: true       // Supercookies no sessionStorage são de sessão
      });
    }
  
    return supercookies;
  }
  
  // Listener para receber mensagens do background
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getSupercookies") {
      sendResponse(detectSupercookies());
    }
  });












  // Função para detectar hooks em funções nativas
function detectHijacking() {
    const threats = [];

    // Funções nativas críticas que podem ser modificadas por scripts maliciosos
    const nativeFunctions = {
        alert: window.alert,
        consoleLog: console.log,
        fetch: window.fetch,
        XMLHttpRequest: window.XMLHttpRequest.prototype.send
    };

    // Verifica se as funções foram substituídas
    if (window.alert !== nativeFunctions.alert) {
        threats.push('Possible hook detected: alert function has been modified.');
    }

    if (console.log !== nativeFunctions.consoleLog) {
        threats.push('Possible hook detected: console.log function has been modified.');
    }

    if (window.fetch !== nativeFunctions.fetch) {
        threats.push('Possible hook detected: fetch function has been modified.');
    }

    if (window.XMLHttpRequest.prototype.send !== nativeFunctions.XMLHttpRequest) {
        threats.push('Possible hook detected: XMLHttpRequest.send has been modified.');
    }

    return threats;
}

// Listener para receber a mensagem de background para detecção de ameaças
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'detectThreats') {
        const threats = detectHijacking();
        sendResponse(threats);
    }
});

