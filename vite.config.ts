import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom'
  },
  server: {
    port: 3000,
    open: true // 開発サーバー起動時に自動でブラウザを開く
  },
  publicDir: 'public' // 公開ディレクトリの指定（デフォルトでもpublicだが念のため）
});