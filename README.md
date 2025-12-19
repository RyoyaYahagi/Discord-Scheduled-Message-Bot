# Discord Scheduled Message Bot

Cloudflare Workers + Cron Trigger + Discord Webhook を使った完全無料のスケジュールメッセージBot。

## 機能

- 指定時刻に Discord へ自動メッセージ送信
- 複数の YouTube URL からランダムに1つを選択
- ユーザー/ロールへのメンション対応

## セットアップ

### 1. Discord Webhook URL の取得

1. Discord でサーバー設定 → 「連携サービス」→「ウェブフック」
2. 「新しいウェブフック」を作成
3. 送信先チャンネルを選択
4. 「ウェブフックURLをコピー」

### 2. 依存関係のインストール

```bash
npm install
```

### 3. シークレットの設定

Cloudflare ダッシュボード、または CLI で設定：

```bash
# Discord Webhook URL（必須）
npx wrangler secret put DISCORD_WEBHOOK_URL

# メンション設定（オプション）
npx wrangler secret put MENTION_IDS
# 例: user:123456789,role:987654321

# テストエンドポイント用シークレット（オプション）
npx wrangler secret put TEST_SECRET
# 任意の文字列を設定
```

### 4. 環境変数の設定

`wrangler.toml` の `[vars]` セクションで設定：

```toml
[vars]
# 複数URLをカンマ区切りで指定（ランダム選択）
YOUTUBE_URLS = "https://youtu.be/xxx,https://youtu.be/yyy"
```

### 5. スケジュールの設定

`wrangler.toml` の `crons` を編集：

```toml
[triggers]
# UTC時間で指定（JSTは UTC+9）
# 17:00 JST = 08:00 UTC
crons = ["0 8 * * 1,3,4,5"]  # 月・水・木・金の17:00 JST
```

**曜日の指定:**
| 数値 | 曜日 |
| ---- | ---- |
| 0    | 日   |
| 1    | 月   |
| 2    | 火   |
| 3    | 水   |
| 4    | 木   |
| 5    | 金   |
| 6    | 土   |

### 6. デプロイ

```bash
npm run deploy
```

## テスト

### 本番環境でテスト

ブラウザで以下にアクセス（認証必須）：
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

```
@ユーザー 早く来い
【今日の音MAD】
https://youtu.be/xxx
```

## 無料枠

| 項目         | 制限         |
| ------------ | ------------ |
| リクエスト数 | 100,000/日   |
| Cron Trigger | 5つまで      |
| 実行時間     | 10ms CPU時間 |

毎日1回の送信なら余裕で無料枠内です。
