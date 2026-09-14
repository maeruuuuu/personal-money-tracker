import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()]
  },

  runtimeConfig: {
    authPassword: process.env.AUTH_PASSWORD || 'changeme',
    sessionPassword: process.env.SESSION_PASSWORD || 'change-this-session-secret-to-something-long-32chars',
    databaseUrl: process.env.DATABASE_URL || 'file:./data/db.sqlite'
  }
})
