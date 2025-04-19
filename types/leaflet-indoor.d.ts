declare module 'leaflet-indoor' {
  // 声明leaflet-indoor模块
  // 这允许TypeScript识别导入但不提供具体类型定义

  global {
    interface Window {
      L: any; // 全局Leaflet对象
    }
  }

  // 扩展Leaflet命名空间
  namespace L {
    namespace Control {
      class Level {
        constructor(options?: {
          level?: string;
          levels?: string[];
          position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
        });
        
        addTo(map: any): this;
        on(event: string, callback: Function): this;
      }
    }
  }
}