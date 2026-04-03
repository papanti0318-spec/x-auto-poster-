// 手動で1回だけ投稿するスクリプト
require('dotenv').config();
const { fetchAllNews } = require('./fetchNews');
const { postTweet, buildTweetText } = require('./postToX');
const { isAlreadyPosted, addToHistory } = require('./history');

async function postOnce() {
  console.log('[postOnce] 手動投稿モード開始');

  const articles = await fetchAllNews();

  if (articles.length === 0) {
    console.log('[postOnce] 記事が0件です');
    return;
  }

  // 未投稿の記事を1件見つける
  const article = articles.find((a) => !isAlreadyPosted(a.url));

  if (!article) {
    console.log('[postOnce] 未投稿の記事がありません');
    return;
  }

  console.log('[postOnce] 投稿候補:');
  console.log(`  タイトル: ${article.title}`);
  console.log(`  URL: ${article.url}`);
  console.log(`  ソース: ${article.source}`);
  console.log(`  ツイート内容:\n---\n${buildTweetText(article)}\n---`);

  const result = await postTweet(article);

  if (result.success) {
    addToHistory(article);
    console.log('[postOnce] 投稿成功!');
  } else {
    console.log(`[postOnce] 投稿失敗: ${result.error}`);
  }
}

postOnce();
