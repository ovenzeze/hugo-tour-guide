import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  runtimeConfig: {
    postgresUrl: process.env.POSTGRES_URL,
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
    elevenlabsBaseUrl: process.env.ELEVENLABS_API_BASE_URL || 'https://api.elevenlabs.io/v1',

    public: {
      elevenlabsDefaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
      elevenlabsDefaultModelId: process.env.ELEVENLABS_DEFAULT_MODEL_ID || 'eleven_multilingual_v2'
    }
  },
  devtools: { enabled: false },
  css: ['~/assets/css/tailwind.css'],


  components: {
    dirs: [
      {
        path: '~/components',
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
    preset: 'vercel',
    publicAssets: [
      {
        baseURL: 'docs',
        dir: 'docs',
        maxAge: 60 * 60 * 24 * 365 // 1 year
      }
    ],
    serverAssets: [
      {
        baseName: 'docs',
        dir: './docs'
      }
    ]
  },

  modules: [
    '@vueuse/nuxt',
    '@vueuse/motion/nuxt',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    '@nuxt/icon',
    'shadcn-nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/mdc',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false,
  },

  mdc: {
    highlight: {
      theme: 'github-dark',
      langs: ['sql', 'typescript', 'javascript', 'vue', 'html', 'css', 'bash', 'json']
    },
    components: {
      prose: true,
      allowedElements: {
        script: false
      }
    }
  },
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
    },
    layoutTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },
  plugins: [],
  // @ts-ignore - Ignore TS error as shadcn-nuxt module should handle this config key
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
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB，足够缓存最大的文件 (6.98MB)
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
    redirectOptions: {
      login: false,
      exclude: ['/**'],
      include: [],
      saveRedirectToCookie: false,
    },
  }
})
