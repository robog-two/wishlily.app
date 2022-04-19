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
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  )
}

export async function decrypt(text: string): Promise<string> {
  if (!text.startsWith('===client_side_enc===')) {
    console.log(await encrypt('text'))
    return text
  } else {
    const encrypted = Buffer.from(text.slice(21), 'base64')
    const iv = new Uint8Array(96)
    await window.crypto.getRandomValues(iv)
    return await new TextDecoder('utf-8').decode(await window.crypto.subtle.decrypt(
      { name: 'AES-GSM', iv },
      await getKey(),
      encrypted
    ))
  }
}

export async function encrypt(text: string): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  console.log(iv)
  return '===client_side_enc===' + Buffer.from(await window.crypto.subtle.encrypt(
    { name: 'AES-GSM', iv },
    await getKey(),
    new TextEncoder().encode(text)
  )).toString('base64')
}
