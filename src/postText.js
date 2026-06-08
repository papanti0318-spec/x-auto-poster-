require('dotenv').config();
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

const TWEET_URL = 'https://api.twitter.com/2/tweets';

async function postText(text) {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.error('[postText] X API認証情報が不足しています。.envを確認してください');
    process.exit(1);
  }

  if (!text || text.trim().length === 0) {
    console.error('[postText] 投稿テキストが空です');
    process.exit(1);
  }

  if (text.length > 280) {
    console.error(`[postText] 文字数オーバー: ${text.length}文字（上限280文字）`);
    process.exit(1);
  }

  const oauth = OAuth({
    consumer: { key: apiKey, secret: apiSecret },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString, key) {
      return crypto.createHmac('sha1', key).update(baseString).digest('base64');
    },
  });

  const token = { key: accessToken, secret: accessTokenSecret };
  const requestData = { url: TWEET_URL, method: 'POST' };
  const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

  console.log('[postText] 投稿中...');
  console.log(`[postText] 内容:\n${text}`);
  console.log(`[postText] 文字数: ${text.length}/280`);

  try {
    const res = await fetch(TWEET_URL, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[postText] 投稿失敗: ${res.status} ${errorBody}`);
      process.exit(1);
    }

    const data = await res.json();
    console.log(`[postText] 投稿成功! Tweet ID: ${data.data.id}`);
    console.log(`[postText] URL: https://x.com/i/status/${data.data.id}`);
  } catch (err) {
    console.error('[postText] エラー:', err.message);
    process.exit(1);
  }
}

// コマンドライン引数からテキストを受け取る
const text = process.argv.slice(2).join(' ');
if (!text) {
  console.error('使い方: node src/postText.js "投稿したいテキスト"');
  process.exit(1);
}

postText(text);
