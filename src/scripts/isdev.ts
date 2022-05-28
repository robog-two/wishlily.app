export async function isDev(): Promise<boolean> {
  try {
    return (await (await fetch('/user/shims/isdev')).json()).isDev
  } catch (e) {
    return import.meta.env.VITE_ENVIRONMENT === 'development'
  }
}

export async function domain(product: string): Promise<string> {
  const which = (await isDev()) ? 1 : 0
  return ({
    mathilda: ['https://proxy.wishlily.app', 'http://127.0.0.1:8080'],
    db: ['https://db.wishlily.app', 'http://127.0.0.1:8081'],
    'db-ws': ['wss://db.wishlily.app', 'ws://127.0.0.1:8081'],
  })[product]?.[which] ?? 'wishlily.app'
}
