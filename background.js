// Cria um hashmap para armazenar dados por aba, incluindo requisições de terceiros
let tabRegistry = new Map();

// Função que extrai o domínio de uma URL
function getDomainFromUrl(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.hostname;
}

// Função que inicializa o registro da aba com o domínio principal e array de terceiros
function initializeTab(tabId, tabUrl) {
  const domain = getDomainFromUrl(tabUrl);
  tabRegistry.set(tabId, { 
    mainDomain: domain, 
    thirdPartyRequests: new Set() 
  });
  console.log(`Tab ${tabId} initialized with domain: ${domain}`);
}

// Função que remove uma aba do hashmap
function removeTab(tabId) {
  if (tabRegistry.has(tabId)) {
    tabRegistry.delete(tabId);
    console.log(`Tab ${tabId} removed from registry.`);
  }
}

// Função que registra uma requisição de terceiros se for para um domínio diferente
function analyzeRequest(tabId, requestUrl) {
  if (tabRegistry.has(tabId)) {
    const tabData = tabRegistry.get(tabId);
    const requestDomain = getDomainFromUrl(requestUrl);
    
    // Se o domínio da requisição for diferente do domínio principal, conta como terceiro
    if (requestDomain !== tabData.mainDomain) {
      tabData.thirdPartyRequests.add(requestDomain);
      console.log(`Third-party request detected: ${requestDomain} for Tab ${tabId}`);
    }
  }
}

// Evento disparado quando uma nova aba é criada
browser.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    initializeTab(tab.id, tab.url);
  }
});

// Evento disparado quando uma aba é atualizada (recarregada)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    initializeTab(tabId, tab.url);
  }
});

// Evento disparado quando uma aba é fechada
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  removeTab(tabId);
});





// Monitora todas as requisições de rede para capturar requisições de terceiros
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const tabId = details.tabId;
    const requestUrl = details.url;
    
    if (tabId !== -1) {  // -1 significa que a requisição não pertence a uma aba
      analyzeRequest(tabId, requestUrl);
    }
  },
  { urls: ["<all_urls>"] }  // Monitora todas as requisições
);

// Função que retorna a lista de domínios de terceiros para uma aba específica
function getThirdPartyRequests(tabId) {
  if (tabRegistry.has(tabId)) {
    const tabData = tabRegistry.get(tabId);
    return Array.from(tabData.thirdPartyRequests);
  }
  return [];
}


















// Função que envia uma mensagem para o content script da aba para obter localStorage
function fetchLocalStorage(tabId) {
  return browser.tabs.sendMessage(tabId, { action: "getLocalStorage" });
}

// Função que envia uma mensagem para o content script da aba para obter sessionStorage
function fetchSessionStorage(tabId) {
  return browser.tabs.sendMessage(tabId, { action: "getSessionStorage" });
}

// Exemplo de como utilizar as funções quando o ícone da extensão é clicado
browser.browserAction.onClicked.addListener((tab) => {
  fetchLocalStorage(tab.id).then((localStorageData) => {
    console.log(`Local Storage Data for Tab ${tab.id}:`, localStorageData);
  });

  fetchSessionStorage(tab.id).then((sessionStorageData) => {
    console.log(`Session Storage Data for Tab ${tab.id}:`, sessionStorageData);
  });
});















// Função auxiliar para verificar se o cookie é de 1ª parte ou 3ª parte
function isThirdPartyCookie(cookieDomain, siteDomain) {
  // Remove "www." e subdomínios para comparar domínios principais
  const normalizedCookieDomain = cookieDomain.replace(/^www\./, '');
  const normalizedSiteDomain = siteDomain.replace(/^www\./, '');
  return !normalizedCookieDomain.endsWith(normalizedSiteDomain);
}

// Função auxiliar para verificar se o cookie é de sessão
function isSessionCookie(cookie) {
  return !cookie.expirationDate; // Se não tiver data de expiração, é um cookie de sessão
}

// Função para categorizar e contar os cookies em diferentes categorias
function categorizeCookies(tabUrl) {
  return browser.cookies.getAll({ url: tabUrl }).then((cookies) => {
    const result = {
      firstPartySession: 0,
      firstPartyPersistent: 0,
      thirdPartySession: 0,
      thirdPartyPersistent: 0,
    };

    const siteDomain = new URL(tabUrl).hostname;

    cookies.forEach((cookie) => {
      const isThirdParty = isThirdPartyCookie(cookie.domain, siteDomain);
      const isSession = isSessionCookie(cookie);

      if (isThirdParty) {
        if (isSession) {
          result.thirdPartySession += 1;
        } else {
          result.thirdPartyPersistent += 1;
        }
      } else {
        if (isSession) {
          result.firstPartySession += 1;
        } else {
          result.firstPartyPersistent += 1;
        }
      }
    });

    return result;
  });
}

// Função que coleta os supercookies (por exemplo, em localStorage e sessionStorage)
// Supercookies podem ser armazenados fora dos cookies tradicionais, como no localStorage/sessionStorage
function collectSupercookies(tabId) {
  return browser.tabs.sendMessage(tabId, { action: "getSupercookies" });
}

// Função principal que categoriza cookies e supercookies
function categorizeAndCountCookiesAndSupercookies(tabId, tabUrl) {
  return Promise.all([categorizeCookies(tabUrl), collectSupercookies(tabId)])
    .then(([cookieData, supercookieData]) => {
      const combinedResult = { ...cookieData };

      // Contabilize supercookies conforme as categorias
      supercookieData.forEach((supercookie) => {
        if (supercookie.isThirdParty) {
          if (supercookie.isSession) {
            combinedResult.thirdPartySession += 1;
          } else {
            combinedResult.thirdPartyPersistent += 1;
          }
        } else {
          if (supercookie.isSession) {
            combinedResult.firstPartySession += 1;
          } else {
            combinedResult.firstPartyPersistent += 1;
          }
        }
      });

      return combinedResult;
    });
}

// Exemplo de uso quando o ícone da extensão é clicado
browser.browserAction.onClicked.addListener((tab) => {
  categorizeAndCountCookiesAndSupercookies(tab.id, tab.url).then((result) => {
    console.log(`Cookies and Supercookies for Tab ${tab.id}:`, result);
  });
});

