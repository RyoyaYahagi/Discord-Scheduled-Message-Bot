# プロジェクト固有ルール

## プロジェクト名
discord-scheduled-bot-cf (Discord Scheduled Message Bot - Cloudflare Workers版)

---

## 1) 憲法ファイル（必読）
- ファイルパス: `GEMINI.md` (このファイル)
- このファイルは必ず最初に読み、すべて遵守すること。

---

## 2) 言語／ランタイム
- 言語: **TypeScript**
- 推奨実行環境: **Cloudflare Workers** (Node.js互換ではない)
- 注意: Cloudflare Workers固有のAPI（`Env`, `ScheduledController`, `ExecutionContext`等）を使用

---

## 3) 主要ツール／チェック
| 項目       | ツール／コマンド                                 |
| ---------- | ------------------------------------------------ |
| ビルド     | `wrangler` (Wrangler CLI v3)                     |
| 型チェック | `npx tsc --noEmit`                               |
| 開発サーバ | `npm run dev` (`wrangler dev`)                   |
| デプロイ   | `npm run deploy` (`wrangler deploy`)             |
| テスト     | `npm run test` (`wrangler dev --test-scheduled`) |

### CI コマンド（必須チェック）
```bash
npx tsc --noEmit && npm run test
```

---

## 4) ファイル参照形式
- 参照形式: `path/to/file.ts:123`（行番号任意）

---

## 5) コーディング規約（必須）

### 型注釈
- すべての公開関数に型注釈を必須: **yes**
- `interface`を使用して環境変数の型を定義（例: `Env`）

### インポート
- ESモジュール形式 (`import/export`) を使用
- パス操作: Workers ではファイルシステムアクセス不可

### Docstring / コメント
- JSDoc形式、日本語で記述
- 公開関数・exportされるオブジェクトには必ず説明コメントを付ける

### コード規約
- strictモード: **必須** (`tsconfig.json`で設定済み)
- `any`型: **禁止**（明確な理由がある場合のみ許可）
- 未使用変数: **禁止**

---

## 6) エラー処理方針
- Fail-fast: fetch失敗時は即座に`console.error`でログ出力
- HTTPレスポンスのステータスコード確認必須
- ログ方針: 日本語のログメッセージ + タイムスタンプはWorkersが自動付与

---

## 7) テスト方針
- テストフレームワーク: Wrangler統合テスト (`--test-scheduled`)
- ネットワーク呼び出し: ローカル開発時はDiscord Webhookへの実際の送信を確認
- シークレット: `wrangler secret`で設定（`.toml`にハードコードしない）

---

## 8) その他の注意点

### 秘密情報
- `DISCORD_WEBHOOK_URL`: シークレットとして管理
- `YOUTUBE_URL`: 環境変数または シークレット
- `MENTION_IDS`: 環境変数（オプション）
- **コードにシークレットをハードコードしない**

### 依存の固定
- `package-lock.json`で依存関係を固定

### Cloudflare Workers 固有
- `fetch`イベント: HTTPリクエスト処理
- `scheduled`イベント: Cron Trigger処理
- `ctx.waitUntil()`: 非同期処理の完了待機に使用可

### Cron設定
- `wrangler.toml`の`[triggers].crons`で設定
- 時刻はUTC表記（JSTから-9時間）

---

## 9) 出力言語
- **日本語**
