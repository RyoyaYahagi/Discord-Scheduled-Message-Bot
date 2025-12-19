# hayakukoi - Discord Scheduled Message Bot

Cloudflare Workers + Cron Trigger + Discord Webhook を使った完全無料のスケジュールメッセージBot。

## 機能

- 指定時刻に Discord へ自動メッセージ送信
- **YouTube Data API** で指定チャンネルの最新動画を自動取得
- API 失敗時は設定済み YouTube URL からランダムに選択（フォールバック）
- ユーザー/ロールへのメンション対応

## セットアップ

### 1. Discord Webhook URL の取得

1. Discord でサーバー設定 → 「連携サービス」→「ウェブフック」
2. 「新しいウェブフック」を作成
3. 送信先チャンネルを選択
4. 「ウェブフックURLをコピー」

### 2. YouTube Data API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「ライブラリ」→「YouTube Data API v3」を有効化
4. 「認証情報」→「認証情報を作成」→「APIキー」で取得

### 3. 依存関係のインストール

```bash
npm install
```

### 4. シークレットの設定

```bash
# Discord Webhook URL（必須）
npx wrangler secret put DISCORD_WEBHOOK_URL

# YouTube API キー（必須）
npx wrangler secret put YOUTUBE_API_KEY

# メンション設定（オプション）
npx wrangler secret put MENTION_IDS
# 例: user:123456789,role:987654321

# テストエンドポイント用シークレット（オプション）
npx wrangler secret put TEST_SECRET
```

### 5. 環境変数の設定

`wrangler.toml` の `[vars]` セクションで設定：

```toml
[vars]
# 動画を取得する YouTube チャンネルID
YOUTUBE_CHANNEL_ID = "UCXcjvt8cOfwtcqaMeE7-hqA"

# フォールバック用 URL（API 失敗時に使用）
YOUTUBE_URLS = "https://youtu.be/xxx,https://youtu.be/yyy"
```

> **チャンネルIDの調べ方**: YouTube チャンネルページの URL `youtube.com/channel/UCxxxxxx` の `UCxxxxxx` 部分

### 6. スケジュールの設定

`wrangler.toml` の `crons` を編集：

```toml
[triggers]
# UTC時間で指定（JSTは UTC+9）
# 17:00 JST = 08:00 UTC
crons = ["0 8 * * 1,3,4,5"]  # 月・水・木・金の17:00 JST
```

| 数値 | 曜日 |
| ---- | ---- |
| 0    | 日   |
| 1    | 月   |
| 2    | 火   |
| 3    | 水   |
| 4    | 木   |
| 5    | 金   |
| 6    | 土   |

### 7. デプロイ

```bash
npm run deploy
```

## テスト

### 本番環境でテスト

```
https://hayakukoi.yhgry.workers.dev/test?token=YOUR_TEST_SECRET
```

### ローカルテスト

```bash
npm run dev -- --remote
# 別ターミナルで:
curl "http://localhost:8787/test?token=YOUR_TEST_SECRET"
```

## メッセージ形式

**YouTube API 成功時:**
```
@ユーザー 早く来い
【今日のSUSURU TV】
https://www.youtube.com/watch?v=xxxxx
```

**フォールバック時:**
```
@ユーザー 早く来い
【今日の音MAD】
https://youtu.be/xxx
```

## 無料枠

| 項目               | 制限          |
| ------------------ | ------------- |
| Workers リクエスト | 100,000/日    |
| Cron Trigger       | 5つまで       |
| YouTube API        | 10,000単位/日 |

毎日1回の送信なら余裕で無料枠内です。
