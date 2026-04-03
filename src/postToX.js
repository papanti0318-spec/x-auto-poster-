const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

const TWEET_URL = 'https://api.twitter.com/2/tweets';

function createOAuthClient() {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    throw new Error(
      '[postToX] X API認証情報が不足しています。.envを確認してください'
    );
  }

  const oauth = OAuth({
    consumer: { key: apiKey, secret: apiSecret },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString, key) {
      return crypto
        .createHmac('sha1', key)
        .update(baseString)
        .digest('base64');
    },
  });

  const token = { key: accessToken, secret: accessTokenSecret };

  return { oauth, token };
}

function buildTweetText(article) {
  const hashtags = '#AI #ととのえるAI通信';
  // URLはt.coで23文字に短縮される
  // 280文字制限: タイトル + 改行 + URL(23) + 改行 + ハッシュタグ
  const urlLength = 23;
  const fixedLength = urlLength + hashtags.length + 4; // 改行×4
  const maxTitleLength = 280 - fixedLength;

  let title = article.title;
  if (title.length > maxTitleLength) {
    title = title.substring(0, maxTitleLength - 1) + '…';
  }

  return `${title}\n\n${article.url}\n\n${hashtags}`;
}

async function postTweet(article) {
  const { oauth, token } = createOAuthClient();
  const tweetText = buildTweetText(article);

  const requestData = {
    url: TWEET_URL,
    method: 'POST',
  };

  const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

  console.log(`[postToX] 投稿中: ${article.title.substring(0, 50)}...`);

  try {
    const res = await fetch(TWEET_URL, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: tweetText }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[postToX] 投稿失敗: ${res.status} ${errorBody}`);
      return { success: false, error: `${res.status}: ${errorBody}` };
    }

    const data = await res.json();
    console.log(`[postToX] 投稿成功! Tweet ID: ${data.data.id}`);
    return { success: true, tweetId: data.data.id };
  } catch (err) {
    console.error('[postToX] 投稿エラー:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { postTweet, buildTweetText };
