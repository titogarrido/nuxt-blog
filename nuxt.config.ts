// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer:  { port: 3002, host: "0.0.0.0"},
  devtools: { enabled: true },
  modules: ['@nuxt/content', "@nuxt/ui", "@nuxthq/studio"],
  ui: {
    icons: ['heroicons', 'solar']
  },
  content: {
    experimental: {
      search: true
    }
  }
})