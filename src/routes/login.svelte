<script lang="ts">
  import { onMount } from 'svelte'
  import { goto, prefetch } from '$app/navigation'
  import { Buffer } from 'buffer/index.js'
  import { domain } from '../scripts/isdev'

  let message = ''

  onMount(async () => {
    prefetch('/dashboard')

    if (!window.localStorage.getItem('encryptionKey')) {
      message = 'Encrypting...'
      const encryptionKey = await window.crypto.subtle.generateKey({
        name: 'AES-CBC',
        length: 128
      }, true, ['encrypt', 'decrypt'])

      const encryptionKeyJSON = await window.crypto.subtle.exportKey(
        'jwk',
        encryptionKey
      )

      const encryptionKeyBase64 = Buffer.from(await JSON.stringify(encryptionKeyJSON)).toString('base64')

      window.localStorage.setItem('encryptionKey', encryptionKeyBase64)
    }

    if (!window.localStorage.getItem('userId')) {
      message = 'Generating user token pair...'

      let userKey: string = ''

      if (window.crypto?.getRandomValues != undefined) {
        let values: Uint32Array = new Uint32Array(30);
        await window.crypto.getRandomValues(values)
        for (let value of values) {
          userKey = userKey + value.toString()
        }
      } else {
        userKey = await (await fetch('/user/shims/key')).text()
      }

      let userId = window.crypto.randomUUID != undefined ? await window.crypto?.randomUUID() : await (await fetch('/user/shims/uuid')).text()

      message = 'Logging in...'

      let response = await fetch(`${await domain('db')}/create_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'Origin': 'https://wishlily.app'
        },
        body: JSON.stringify({
          userId,
          userKey
        })
      })

      if (response.status < 200 || response.status > 400) {
        message = 'Login failed! Check connection!'
        console.log(await response.text())
        return
      } else {
        window.localStorage.setItem('userId', userId)
        window.localStorage.setItem('userKey', userKey)
      }
    } else {
      // message = 'Refreshing login...'
      // let response = await fetch(`${await domain('db')}/confirm_user`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Origin': 'https://wishlily.app'
      //   },
      //   body: JSON.stringify({
      //     userId: window.localStorage.getItem('userId'),
      //     userKey: window.localStorage.getItem('userKey')
      //   })
      // })

      // if (response.status !== 204) {
      //   message = 'Login failed! Your token is corrupt.'
      //   console.log(await response.text())
      //   return
      // }
    }

    if (window.location.hash?.startsWith('https://wishlily.app')) {
      goto(decodeURIComponent(window.location.hash).slice(20))
    } else {
      goto('/dashboard')
    }
  })
</script>

<style>
  h1 {
    width: 100%;
    text-align: center;
    margin-top: 10vh;
    font-family: sans-serif;
  }
</style>

<h1>{message}</h1>
{#if message === 'Login failed! Your token is corrupt.'}
  <p>Click <a href="/delete-data">here</a> to reset your data.</p>
{/if}
