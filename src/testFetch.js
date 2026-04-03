// ニュース取得のテスト（X APIキー不要）
require('dotenv').config();
const { fetchAllNews } = require('./fetchNews');
const { buildTweetText } = require('./postToX');
const { isAlreadyPosted } = require('./history');

async function test() {
  console.log('[test] ニュース取得テスト開始\n');

  const articles = await fetchAllNews();

  console.log(`\n--- 取得結果: ${articles.length}件 ---\n`);

  articles.forEach((article, i) => {
    const posted = isAlreadyPosted(article.url) ? '[投稿済]' : '[未投稿]';
    console.log(`${i + 1}. ${posted} [${article.source}] ${article.title}`);
    console.log(`   URL: ${article.url}`);
    console.log(`   スコア: ${article.score}`);
    console.log('');
  });

  if (articles.length > 0) {
    const sample = articles.find((a) => !isAlreadyPosted(a.url)) || articles[0];
    console.log('--- ツイートプレビュー ---');
    console.log(buildTweetText(sample));
    console.log('--- 終了 ---');
  }
}

test();
