import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  runtimeConfig: {
    postgresUrl: process.env.POSTGRES_URL,
    public: {}
  },
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],

  // Vue配置，禁用实验性功能警告
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'Suspense'
    },
    config: {
      warnHandler: function(msg: string, vm: any, trace: any) {
        // 忽略Suspense相关警告
        if (msg.includes('Suspense is an experimental feature')) {
          return
        }
        console.warn(msg, trace)
      }
    }
  },

  // 添加组件自动导入配置
  components: {
    dirs: [
      {
        path: '~/components',
        // 排除ui组件文件夹内的index.ts文件
        ignore: ['**/*/index.ts']
      }
    ]
  },

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
    '@vueuse/nuxt',
    '@vueuse/motion/nuxt',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@vite-pwa/nuxt',
    '@nuxtjs/leaflet',
    '@nuxtjs/mdc'
  ],

  motion: {
    directives: {
      // 启用默认的motion指令
      'motion': true,
      'motion-fade': true,
      'motion-pop': true
    }
  },


  // MDC模块配置
  mdc: {
    // 可选配置项
    highlight: {
      theme: 'github-dark'
    }
  },
  // Google Fonts 配置
  googleFonts: {
    // @ts-ignore
    families: {
      "Inter": [400, 700],
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
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/icons/favicons/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/icons/favicons/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/images/icons/favicons/favicon-16x16.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'mask-icon', href: '/images/icons/favicons/safari-pinned-tab.svg', color: '#5bbad5' }
      ]
    }
  },
  plugins: [
  ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Hugo Tour Guide',
      short_name: 'HugoGuide',
      description: 'Hugo Tour Guide App',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'en',
      start_url: '/?source=pwa',
      icons: [
        {
          src: '/images/icons/favicons/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/images/icons/favicons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/images/icons/favicons/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
          purpose: 'apple touch icon'
        },
        {
          src: '/images/icons/favicons/maskable-icon.png',
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
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/.*\/$/],
      type: 'module'
    },
  }
})