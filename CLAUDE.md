# X Auto Poster（ととのえるAI通信 自動投稿ツール）

AI_RADARのニュース記事をX（Twitter）に自動投稿するNode.jsツール。

## プロジェクト概要

- AI_RADAR（https://ai-radar-git-main-papanti0318-specs-projects.vercel.app）のニュース記事を取得
- X API v2で自動投稿
- 1日数回の定期実行（重複投稿なし）

## 技術スタック

- Node.js
- X API v2（OAuth 1.0a User Context）
- node-cron（スケジューリング）
- SQLite or JSONファイル（投稿履歴管理・重複防止）

## 投稿フォーマット

```
{記事タイトル}
{記事URL}
#AI #ととのえるAI通信
```

- 280文字制限に収まるようタイトルを調整する
- URLはt.coで短縮されるため、実質23文字としてカウント

## 重複投稿防止の仕組み

- 投稿済み記事のURLをローカルDBに保存
- 投稿前にURLで重複チェック
- 同じ記事は二度投稿しない

## 投稿タイミング

- 1日3〜4回（朝8時・昼12時・夕方18時・夜21時を想定）
- node-cronで制御
- 各回1〜2記事ずつ投稿（スパム防止）

## 環境変数（.env）

- `X_API_KEY` — X API Key（Consumer Key）
- `X_API_SECRET` — X API Secret（Consumer Secret）
- `X_ACCESS_TOKEN` — アクセストークン
- `X_ACCESS_TOKEN_SECRET` — アクセストークンシークレット
- `AI_RADAR_URL` — AI_RADARのベースURL（デフォルト: https://ai-radar-git-main-papanti0318-specs-projects.vercel.app）

## ディレクトリ構成

```
x-auto-poster/
├── CLAUDE.md
├── package.json
├── .env              （Git管理外）
├── .gitignore
├── src/
│   ├── index.js      （メインエントリ・スケジューラ）
│   ├── fetchNews.js   （AI_RADARからニュース取得）
│   ├── postToX.js     （X API v2で投稿）
│   └── history.js     （投稿履歴管理・重複チェック）
└── data/
    └── posted.json    （投稿履歴ファイル）
```

## X API v2 ツイート投稿エンドポイント

- `POST https://api.twitter.com/2/tweets`
- OAuth 1.0a署名が必要
- リクエストボディ: `{ "text": "投稿内容" }`

## 開発ルール

- 指示は日本語で受け付ける
- コードを変更したらGitHubにpushする手順も教える
- 作業が全部終わったら「今回何をしたか」を小学生でもわかるように日本語で説明する
- APIキーは絶対にコードにハードコードしない
- .envファイルはGitに含めない
- エラーハンドリングは必ず実装する（try-catch + ログ出力）

## 関連プロジェクト

- AI_RADAR: `C:\Users\sirub\projects\ai-radar\`
- GitHub: papanti0318-spec/ai-radar
