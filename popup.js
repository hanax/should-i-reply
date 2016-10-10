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

function renderAt(id, text) {
  document.getElementById(id).textContent = text;
}

function formateDate(rawDate) {
  return Math.round(rawDate / 1000 / 60 * 100) / 100;
}

function displayCurConvoInfo(e) {
  if (!e) {
    return;
  }

  renderAt('status', 'Out of ' + e.messageNumber + ' most recent messages with ' + e.oppName + ':');

  var cntSession = 0;
  // 0: self, 1: opp
  var tot = [0, 0];
  var start = [0, 0];
  var last = -1;
  var cnt = [0, 0];

  for (var i in e.messages) {
    var m = e.messages[i];
    if (m.type === 'separator') {
      start[0] = 0;
      start[1] = 0;
      last = -1;
    } else {
      var cur = m.source === 'self' ? 0 : 1;
      cnt[cur] ++;
      start[cur] = m.time;
      if (last !== cur) {
        if (start[1 - cur] === 0) {
          continue;
        }
        tot[cur] += m.time - start[1 - cur];
        cntSession ++;
        last = cur;
      }
    }
  }

  var aveSelf = formateDate(tot[0] / cntSession);
  var aveOpp = formateDate(tot[1] / cntSession);
  renderAt('stats_self', aveSelf);
  renderAt('name_opp1', e.oppName);
  renderAt('stats_opp', aveOpp);

  renderAt('n_self', cnt[0]);
  renderAt('name_opp2', e.oppName);
  renderAt('n_opp', cnt[1]);

  var lastMsg = e.messages[e.messages.length - 1];
  var expectReplyTime = formateDate(lastMsg.time + (tot[1] / cntSession) - Date.now());
  if (lastMsg.type === 'separator' || expectReplyTime < 0) {
    renderAt('title', 'YES');
  } else {
    renderAt('title', 'NO');
    renderAt('suggestion', 'Maybe in ' + expectReplyTime + ' minutes.');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(tab) {
    renderAt('status', 'Loading...');

    if (urlRegex.test(tab.url)) {
      chrome.tabs.sendMessage(tab.id, { text: 'getMessages', oppName: tab.url.match(urlRegex)[1] }, displayCurConvoInfo);
    }
  });
});