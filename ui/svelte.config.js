import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  compilerOptions: {
    // 👇 互換モード有効化
    compatibility: {
      componentApi: 4
    }
  },
  preprocess: vitePreprocess(),
}
