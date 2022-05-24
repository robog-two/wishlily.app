import { isDev } from "../../../scripts/isdev";

export async function get() {
  return {
    status: 200,
    body: {
      isDev: isDev()
    }
  }
}
