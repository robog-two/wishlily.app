import { goto, prefetch } from '$app/navigation'
import { Buffer } from 'buffer/'

export async function checkLogin() {
  prefetch('/login')

  if (!window.localStorage.getItem('encryptionKey')) {
    goto(`/login#${encodeURIComponent(window.location.href)}`)
  } else {
    window.location.hash = window.localStorage.getItem('encryptionKey')
  }
}

async function getKey(): Promise<CryptoKey> {
  const keyBase64 = window.location.hash ?? window.localStorage.getItem('encryptionKey')

  if (keyBase64 === null) {
    goto(`/login#${encodeURIComponent(window.location.href)}`)
    throw new Error('Unable to load encryption keys.')
  }

  return await window.crypto.subtle.importKey(
    'jwk',
    JSON.parse(
      Buffer.from(keyBase64, 'base64').toString()
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
  const encrypted = Buffer.from(await window.crypto.subtle.encrypt(
    { name: 'AES-CBC', length: 128, iv },
    await getKey(),
    Buffer.from(text, 'utf8') as ArrayBuffer
  )).toString('hex')

  console.log(encrypted)

  return `client_side_enc,${encrypted},${Buffer.from(iv).toString('hex')}`
}
