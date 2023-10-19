import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import storyblok from '@storyblok/astro';
import tailwind from '@astrojs/tailwind';
import react from "@astrojs/react";
const env = loadEnv('', process.cwd(), 'STORYBLOK');
const PUBLIC_ENV = loadEnv('', process.cwd(), 'PUBLIC_ENV');


// https://astro.build/config
export default defineConfig({
  site: 'https://www.szkollnau.de',
  integrations: [storyblok({
    accessToken: env.STORYBLOK_TOKEN,
    bridge: process.env.PUBLIC_ENV === 'preview',
    apiOptions: {
      // Choose your Storyblok space region
      region: 'eu'
    },
    // storyblok-js-client options
    components: {
      // Collections
      // Page: 'storyblok/Page',
      // Fund: 'storyblok/Fund',
      // Article: 'storyblok/Article',
      // RichText blocks
      // TableHtml: 'storyblok/TableHtml',
    },
    componentsDir: 'src',
    enableFallbackComponent: true,
    // customFallbackComponent: 'storyblok/FallbackComponent',
    useCustomApi: false
  }), mdx(), sitemap(), tailwind({
    // We use our own base.css file
    applyBaseStyles: false
  }), react()]
});