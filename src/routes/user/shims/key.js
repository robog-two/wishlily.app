import crypto from 'crypto'

export async function get() {
  const values = await crypto.randomBytes(30)

  let userKey = ''
  for (let value of values) {
    userKey = userKey + value.toString()
  }

  return {
    status: 200,
    body: userKey
  };
}
