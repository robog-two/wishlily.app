import crypto from 'crypto'

export async function get() {
  return {
    status: 200,
    body: (await crypto.randomUUID()).toString()
  };
}
