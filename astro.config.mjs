import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";
import auth from 'auth-astro';
import htmx from 'astro-htmx';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), auth(), htmx()],
  output: "server",
  adapter: node({
    mode: 'standalone',
  }),
});
