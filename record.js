const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_FILE = path.join(__dirname, 'data', 'performance.json');

// --- データ読み書き ---

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

// --- CLIユーティリティ ---

function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

// --- add コマンド ---

async function addRecord() {
  const rl = createRL();

  try {
    const dateStr = await ask(rl, '投稿日時 (例: 2026-04-04 12:00): ');
    const content = await ask(rl, 'ツイート内容: ');
    const impressions = await ask(rl, '24h後インプレッション数: ');

    const parsed = new Date(dateStr.replace(' ', 'T') + '+09:00');
    if (isNaN(parsed.getTime())) {
      console.error('日時の形式が正しくありません。例: 2026-04-04 12:00');
      return;
    }

    const record = {
      date: dateStr.trim(),
      dayOfWeek: ['日', '月', '火', '水', '木', '金', '土'][parsed.getDay()],
      hour: parsed.getHours(),
      content: content.trim(),
      impressions: parseInt(impressions, 10),
      createdAt: new Date().toISOString(),
    };

    const records = loadData();
    records.push(record);
    saveData(records);

    console.log(`\n記録しました（${record.dayOfWeek}曜 ${record.hour}時台 / ${record.impressions} imp）`);
  } finally {
    rl.close();
  }
}

// --- stats コマンド ---

function showStats() {
  const records = loadData();

  if (records.length === 0) {
    console.log('まだ記録がありません。 node record.js add で追加してください。');
    return;
  }

  console.log(`\n=== 投稿パフォーマンス（全${records.length}件）===\n`);

  // --- 時間帯別 ---
  const byHour = {};
  for (const r of records) {
    if (!byHour[r.hour]) byHour[r.hour] = [];
    byHour[r.hour].push(r.impressions);
  }

  console.log('■ 時間帯別 平均インプレッション');
  const hourEntries = Object.entries(byHour)
    .map(([h, imps]) => ({
      hour: parseInt(h, 10),
      avg: Math.round(imps.reduce((a, b) => a + b, 0) / imps.length),
      count: imps.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  for (const e of hourEntries) {
    const bar = '█'.repeat(Math.min(Math.round(e.avg / 100), 30));
    console.log(`  ${String(e.hour).padStart(2)}時  ${String(e.avg).padStart(6)} imp  (${e.count}件) ${bar}`);
  }

  // --- 曜日別 ---
  const byDay = {};
  for (const r of records) {
    if (!byDay[r.dayOfWeek]) byDay[r.dayOfWeek] = [];
    byDay[r.dayOfWeek].push(r.impressions);
  }

  console.log('\n■ 曜日別 平均インプレッション');
  const dayOrder = ['月', '火', '水', '木', '金', '土', '日'];
  for (const day of dayOrder) {
    if (!byDay[day]) continue;
    const imps = byDay[day];
    const avg = Math.round(imps.reduce((a, b) => a + b, 0) / imps.length);
    const bar = '█'.repeat(Math.min(Math.round(avg / 100), 30));
    console.log(`  ${day}曜  ${String(avg).padStart(6)} imp  (${imps.length}件) ${bar}`);
  }

  // --- ベスト投稿 ---
  const sorted = [...records].sort((a, b) => b.impressions - a.impressions);
  const top3 = sorted.slice(0, 3);

  console.log('\n■ ベスト投稿 TOP3');
  top3.forEach((r, i) => {
    const preview = r.content.length > 50 ? r.content.slice(0, 50) + '...' : r.content;
    console.log(`  ${i + 1}. ${r.impressions} imp | ${r.date}（${r.dayOfWeek}） | ${preview}`);
  });

  // --- ベスト時間帯の推奨 ---
  if (hourEntries.length > 0) {
    const best = hourEntries[0];
    console.log(`\n★ おすすめ投稿時間: ${best.hour}時台（平均 ${best.avg} imp）`);
  }

  console.log('');
}

// --- メイン ---

const command = process.argv[2];

if (command === 'add') {
  addRecord();
} else if (command === 'stats') {
  showStats();
} else {
  console.log('使い方:');
  console.log('  node record.js add    # 新規記録');
  console.log('  node record.js stats  # パターン表示');
}
