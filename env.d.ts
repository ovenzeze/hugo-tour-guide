/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Environment variables can be defined here, e.g.:
  // readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
