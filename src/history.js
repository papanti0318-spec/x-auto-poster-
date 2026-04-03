const fs = require('fs');
const path = require('path');

const HISTORY_FILE = path.join(__dirname, '..', 'data', 'posted.json');

function loadHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[history] 履歴ファイル読み込みエラー:', err.message);
    return [];
  }
}

function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.error('[history] 履歴ファイル書き込みエラー:', err.message);
  }
}

function isAlreadyPosted(url) {
  const history = loadHistory();
  return history.some((entry) => entry.url === url);
}

function addToHistory(article) {
  const history = loadHistory();
  history.push({
    url: article.url,
    title: article.title,
    postedAt: new Date().toISOString(),
  });
  // 直近500件だけ保持（ファイル肥大化防止）
  if (history.length > 500) {
    history.splice(0, history.length - 500);
  }
  saveHistory(history);
}

module.exports = { loadHistory, isAlreadyPosted, addToHistory };
