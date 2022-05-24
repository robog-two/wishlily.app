import { isDev } from "../../../scripts/isdev";

export async function get() {
  return {
    status: 200,
    body: {
      isDev: import.meta.env.VITE_ENVIRONMENT === 'development'
    }
  }
}
