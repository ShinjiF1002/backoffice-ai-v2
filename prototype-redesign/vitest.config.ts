import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

// 本番 vite.config.ts を継承し (alias '@' 等)、test 設定のみ上乗せ。
// 本番 build 設定は触らない (Phase 0 方針)。test は src/__tests__/ に隔離。
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/__tests__/setup.ts'],
      include: ['src/__tests__/**/*.test.{ts,tsx}'],
    },
  }),
)
