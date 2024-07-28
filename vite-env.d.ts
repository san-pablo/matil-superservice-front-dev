
interface ImportMetaEnv {
    readonly VITE_PUBLIC_API_URL: string
    readonly VITE_ENCRIPTION_KEY: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  