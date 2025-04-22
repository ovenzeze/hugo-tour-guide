import { Ref } from 'vue'

// usePwa composable 返回类型声明
export interface UsePwaReturn {
  isPwa: Ref<boolean>;
  checkPwaStatus: () => void;
}

// 声明全局函数
declare global {
  const usePwa: () => UsePwaReturn;
}

export {}; 