
interface ImportMetaEnv {
    readonly VITE_PUBLIC_API_URL: string
    readonly VITE_VERSION: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  