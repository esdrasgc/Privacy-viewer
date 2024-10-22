// Envia uma mensagem ao background.js para obter as conexões de terceiros
browser.runtime.sendMessage({ action: "getThirdPartyConnections" }).then((thirdPartyConnections) => {
    const listElement = document.getElementById('third-party-list');
  
    if (thirdPartyConnections && thirdPartyConnections.length > 0) {
      thirdPartyConnections.forEach((connection) => {
        const listItem = document.createElement('li');
        listItem.textContent = connection;
        listElement.appendChild(listItem);
      });
    } else {
      const listItem = document.createElement('li');
      listItem.textContent = "No third-party connections detected.";
      listElement.appendChild(listItem);
    }
  });
  