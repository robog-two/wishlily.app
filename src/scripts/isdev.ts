export function isDev(): boolean {
  return import.meta.env.VITE_ENVIRONMENT === 'development'
}
