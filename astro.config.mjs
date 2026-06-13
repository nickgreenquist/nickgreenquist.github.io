// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  // Canonical domain (matches public/CNAME and the hardcoded siteUrl in
  // Layout.astro / feed.xml.ts). Required for correct sitemap + canonical URLs.
  site: 'https://nickgreenquist.com',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    // Dual Shiki themes: light renders inline, dark exposed as --shiki-dark*
    // custom properties that src/styles/global.css activates under `.dark`.
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'light',
    },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});