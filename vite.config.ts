// Vercel-ready Vite config for سكينة (Sakeenah)
// Switches from Cloudflare Workers (Lovable default) → Vercel Functions
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // @ts-ignore – nitro preset override
  nitro: {
    preset: "vercel",
  },
});
