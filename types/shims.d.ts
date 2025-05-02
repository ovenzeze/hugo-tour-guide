// 为缺失的模块和路径提供类型声明
declare module '#app' {
  import type { RouteLocationNormalized } from 'vue-router'
  
  export const defineNuxtRouteMiddleware: (
    middleware: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void | Promise<void>
  ) => void
  
  export const navigateTo: (to: string | RouteLocationNormalized) => void | Promise<void>
  export const useAsyncData: any
}

declare module '#pwa' {
  export const useFaviconPwaIcon: any
  export const useApplePwaIcon: any
  export const useMaskablePwaIcon: any
  export const useTransparentPwaIcon: any
  export const useAppleSplashScreenPwaIcon: any
}

declare module '#build/pwa-icons/pwa-icons' {
  export interface PWAIcons {
    [key: string]: any
  }
}

declare module '#build/pwa-icons/PwaFaviconImage' {
  export interface PwaFaviconImageProps {
    [key: string]: any
  }
}

declare module '#build/pwa-icons/PwaAppleImage' {
  export interface PwaAppleImageProps {
    [key: string]: any
  }
}

declare module '#build/pwa-icons/PwaMaskableImage' {
  export interface PwaMaskableImageProps {
    [key: string]: any
  }
}

declare module '#build/pwa-icons/PwaTransparentImage' {
  export interface PwaTransparentImageProps {
    [key: string]: any
  }
}

declare module '#build/pwa-icons/PwaAppleSplashScreenImage' {
  export interface PwaAppleSplashScreenImageProps {
    [key: string]: any
  }
}

declare module 'ofetch' {
  export const $fetch: any
} 