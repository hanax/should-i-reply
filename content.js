var idRegex = /^wm:mid.([0-9]+):.*/;

// Note that this DOM parser heavily depends on the layout of https://facebook.com/messages/
// and is not robust at all!!
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.text && msg.text === 'getMessages' && !msg.oppName.includes('?')) {
    // oppName: friend id
    // messageNumber: number of currently lodaded messages
    // messages: parsed messages with source and time info
    sendResponse({
      oppName: msg.oppName,
      messageNumber: document.getElementsByClassName("webMessengerMessageGroup").length,
      messages: Array.from(document.getElementById("webMessengerRecentMessages").childNodes).map(function(n) {
        if (n.className.includes('webMessengerMessageGroup')) {
          // A regular message
          return {
            // The message should either come from friend (opp) or the user (self)
            source: n.childNodes[1].firstChild.firstChild.href.includes(msg.oppName) ? 'opp' : 'self',
            type: 'msg',
            time: parseInt(n.id.match(idRegex)[1], 10)
          };
        } else {
          // Separator usually means the start of a convo session
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
