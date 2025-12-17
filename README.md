# Discord Scheduled Message Bot (Cloudflare Workers版)

Cloudflare Workers + Cron Trigger + Discord Webhookを使った完全無料のスケジュールメッセージBot。

## セットアップ

### 1. Discord Webhook URLの取得

1. Discordでサーバー設定 → 「連携サービス」→「ウェブフック」
2. 「新しいウェブフック」を作成
3. 送信先チャンネルを選択
4. 「ウェブフックURLをコピー」

### 2. 依存関係のインストール

```bash
npm install
```

### 3. シークレットの設定

```bash
# Discord Webhook URL
npx wrangler secret put DISCORD_WEBHOOK_URL
# プロンプトでURLを入力

# YouTube URL
npx wrangler secret put YOUTUBE_URL
# プロンプトでURLを入力

# メンション設定（オプション）
npx wrangler secret put MENTION_IDS
# 例: user:123456789,role:987654321
```

### 4. スケジュールの設定

`wrangler.toml` の `crons` を編集：

```toml
[triggers]
# UTC時間で指定（JSTは UTC+9）
# 17:00 JST = 08:00 UTC
crons = ["0 8 * * 1,2,3,4,5"]  # 月〜金の17:00 JST
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

### 5. デプロイ

```bash
npm run deploy
```

## ローカルテスト

```bash
# 開発サーバー起動
npm run dev

# Cronをテスト（別ターミナルで）
curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"

# または手動テスト
curl "http://localhost:8787/test"
```

## 無料枠

| 項目         | 制限         |
| ------------ | ------------ |
| リクエスト数 | 100,000/日   |
| Cron Trigger | 5つまで      |
| 実行時間     | 10ms CPU時間 |

毎日1回の送信なら余裕で無料枠内です。
# hayakukoi
