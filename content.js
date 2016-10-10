var idRegex = /^wm:mid.([0-9]+):.*/;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.text && msg.text === 'getMessages') {
    sendResponse({
      oppName: msg.oppName,
      messageNumber: document.getElementsByClassName("webMessengerMessageGroup").length,
      messages: Array.from(document.getElementById("webMessengerRecentMessages").childNodes).map(function(n) {
        if (n.className.includes('webMessengerMessageGroup')) {
          return {
            source: n.childNodes[1].firstChild.firstChild.href.includes(msg.oppName) ? 'opp' : 'self',
            type: 'msg',
            time: parseInt(n.id.match(idRegex)[1], 10)
          };
        } else {
          return {
            source: '',
            type: 'separator',
            time: ''
          };
        }
      })
    });
  }
});
