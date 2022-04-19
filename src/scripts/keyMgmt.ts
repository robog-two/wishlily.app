import { goto, prefetch } from '$app/navigation'
import { Buffer } from 'buffer/'

export async function checkLogin() {
  prefetch('/login')

  if (!window.localStorage.getItem('encryptionKey')) {
    goto(`/login#${window.location.href}`)
  } else {
    window.location.hash = window.localStorage.getItem('encryptionKey')
  }
}

async function getKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.importKey(
    'jwk',
    JSON.parse(
      Buffer.from(window.location.hash || window.localStorage.getItem('encryptionKey'), 'base64').toString()
    ),
    { name: 'AES-CBC', length: 128 },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function decrypt(text: string): Promise<string> {
  try {
    if (!text.startsWith('client_side_enc,')) {
      console.log(await encrypt(text))
      return text
    } else {
      const sliced = text.slice(16).split(',')
      const encrypted = Buffer.from(sliced[0], 'hex')
      const iv = Buffer.from(sliced[1], 'hex') as ArrayBuffer
      return Buffer.from(await window.crypto.subtle.decrypt(
        { name: 'AES-CBC', length: 128, iv },
        await getKey(),
        encrypted
      )).toString('utf8')
    }
  } catch (e) {
    console.log(e)
    return ''
  }
}

export async function encrypt(text: string): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(16))
  return 'client_side_enc,' + Buffer.from(await window.crypto.subtle.encrypt(
    { name: 'AES-CBC', length: 128, iv },
    await getKey(),
    Buffer.from(text, 'utf8') as ArrayBuffer
  )).toString('hex') + ',' + Buffer.from(iv).toString('hex')
}
