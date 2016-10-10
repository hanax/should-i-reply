var urlRegex = /^https?:\/\/www.facebook.com\/messages\/(.*)/;

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs[0]);
  });
}

function renderAtId(id, text) {
  document.getElementById(id).textContent = text;
}

function renderAtAllClasses(className, text) {
  Array.from(document.getElementsByClassName(className)).forEach(function(e) {
    e.textContent = text;
  });
}

function formatDate(rawDate) {
  return Math.round(rawDate / 1000 / 60 * 100) / 100;
}

function displayCurConvoInfo(e) {
  if (!e) {
    renderAtId('error', 'Oops something went wrong. Please refresh and try again :(');
    return;
  }
  renderAtId('error', '');

  renderAtId('status', 'Out of ' + e.messageNumber + ' most recent messages with ' + e.oppName + ':');
  renderAtAllClasses('name_opp', e.oppName);

  var cntSession = 0;
  var last = -1;
  // 0: self, 1: opp
  var totReplyTime = [0, 0];
  var lastReplyTimestamp = [0, 0];
  var totMsgNumber = [0, 0];

  for (var i in e.messages) {
    var m = e.messages[i];
    if (m.type === 'separator') {
      // A separator means a start of a convo session. Restart timestamp.
      lastReplyTimestamp[0] = 0;
      lastReplyTimestamp[1] = 0;
      last = -1;
    } else {
      // Update timestamps otherwise.
      var cur = m.source === 'self' ? 0 : 1;
      totMsgNumber[cur] ++;
      lastReplyTimestamp[cur] = m.time;
      if (last !== cur) {
        if (lastReplyTimestamp[1 - cur] === 0) {
          continue;
        }
        totReplyTime[cur] += m.time - lastReplyTimestamp[1 - cur];
        cntSession ++;
        last = cur;
      }
    }
  }

  renderAtId('stats_self', formatDate(totReplyTime[0] / cntSession));
  renderAtId('stats_opp', formatDate(totReplyTime[1] / cntSession));

  renderAtId('n_self', totMsgNumber[0]);
  renderAtId('n_opp', totMsgNumber[1]);

  var lastMsg = e.messages[e.messages.length - 1];
  // Expected reply time should be at least as long as the longest reply time of either side.
  var expectReplyTime = formatDate(lastMsg.time + (totReplyTime[1] / cntSession) - Date.now());

  if (lastMsg.type === 'separator' || expectReplyTime < 0 || totReplyTime[0] > totReplyTime[1]) {
    renderAtId('title', 'YES');
  } else {
    renderAtId('title', 'NO');
    renderAtId('suggestion', 'Maybe in ' + expectReplyTime + ' minutes.');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(tab) {
    renderAtId('error', 'Loading...');

    // Get friend id from route
    if (urlRegex.test(tab.url)) {
      chrome.tabs.sendMessage(tab.id, { text: 'getMessages', oppName: tab.url.match(urlRegex)[1] }, displayCurConvoInfo);
    }
  });
});