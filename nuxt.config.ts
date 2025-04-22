// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  runtimeConfig: {
    // 服务器端可用的私有键
    postgresUrl: process.env.POSTGRES_URL,
    // 可以暴露给客户端的公共键
    public: {
      // postgresUrl: process.env.POSTGRES_URL
    }
  },
  devtools: { enabled: false },
  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: true
    }
  },

  nitro: {
    preset: 'vercel'
  },

  // 已移除content配置
  modules: [
    'shadcn-nuxt',
    "@nuxtjs/google-fonts",
    '@nuxt/icon',
    '@vueuse/motion/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/leaflet',
    '@nuxtjs/mdc'
  ],


  // MDC模块配置
  mdc: {
    // 可选配置项
    highlight: {
      theme: 'github-dark'
    }
  },
  googleFonts: {
    families: {
      Inter: [400, 700],
      "Crimson Text": [400, 600, 700],
      "Noto Sans SC": [400, 600],
    },
    subsets: ['latin'],
    download: true,
    preload: true,
    useStylesheet: true
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimum-scale=1',
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Hugo' },
        { name: 'theme-color', content: '#ffffff' }
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' }
      ]
    }
  },
  plugins: [
    '~/plugins/pinia',
  ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Hugo Tour Guide',
      short_name: 'Hugo',
      description: 'Hugo Tour Guide App',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'zh',
      start_url: '/?source=pwa',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
          purpose: 'apple touch icon'
        },
        {
          src: '/maskable-icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\//],  // 匹配所有以/开头的路径
      type: 'module'
    }
  }
})