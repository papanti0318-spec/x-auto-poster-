require('dotenv').config();
const cron = require('node-cron');
const { fetchAllNews } = require('./fetchNews');
const { postTweet } = require('./postToX');
const { isAlreadyPosted, addToHistory } = require('./history');

const MAX_POSTS_PER_RUN = 2; // 1回あたりの最大投稿数（スパム防止）

async function run() {
  console.log(`\n[scheduler] 投稿処理開始: ${new Date().toLocaleString('ja-JP')}`);

  try {
    const articles = await fetchAllNews();

    if (articles.length === 0) {
      console.log('[scheduler] 記事が0件のためスキップ');
      return;
    }

    let postCount = 0;

    for (const article of articles) {
      if (postCount >= MAX_POSTS_PER_RUN) {
        console.log(`[scheduler] 最大投稿数(${MAX_POSTS_PER_RUN})に達したため終了`);
        break;
      }

      if (isAlreadyPosted(article.url)) {
        continue;
      }

      const result = await postTweet(article);

      if (result.success) {
        addToHistory(article);
        postCount++;
        // 連続投稿を避けるため少し待つ
        if (postCount < MAX_POSTS_PER_RUN) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } else {
        console.error(`[scheduler] 投稿失敗、次の記事へ: ${result.error}`);
      }
    }

    console.log(`[scheduler] 完了: ${postCount}件投稿`);
  } catch (err) {
    console.error('[scheduler] 実行エラー:', err.message);
  }
}

// --- スケジュール設定 ---
// 毎日 8:00, 12:00, 18:00, 21:00 に実行
const schedules = [
  '0 8 * * *',
  '0 12 * * *',
  '0 18 * * *',
  '0 21 * * *',
];

console.log('[scheduler] X Auto Poster 起動');
console.log('[scheduler] スケジュール: 毎日 8:00 / 12:00 / 18:00 / 21:00');

schedules.forEach((schedule) => {
  cron.schedule(schedule, run, { timezone: 'Asia/Tokyo' });
});

// 起動直後に1回実行するか確認
if (process.argv.includes('--run-now')) {
  console.log('[scheduler] --run-now フラグ検出、即時実行します');
  run();
}
