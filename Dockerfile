# 開発用Dockerイメージ
FROM node:20-slim

# 作業ディレクトリを設定
WORKDIR /app

# npmのキャッシュを活用するためpackage.jsonを先にコピー
COPY package.json package-lock.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー（開発時はボリュームマウントで上書き）
COPY . .

# wranglerが使用するポート
EXPOSE 8787

# デフォルトコマンド
CMD ["npm", "run", "dev"]
