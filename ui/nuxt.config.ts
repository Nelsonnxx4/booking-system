export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:5000'
    }
  },
  modules: [],
  css: ['~/assets/css/main.css']
})