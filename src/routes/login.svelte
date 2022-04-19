<script lang="ts">
  import { onMount } from 'svelte'
  import { goto, prefetch } from '$app/navigation'
  import { Buffer } from 'buffer/'

  let message = 'Logging in...'

  onMount(async () => {
    prefetch('/dashboard')

    if (!window.localStorage.getItem('encryptionKey')) {
      const encryptionKey = await window.crypto.subtle.generateKey({
        name: 'AES-GCM',
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
      let values: Uint32Array = new Uint32Array(30);
      await window.crypto.getRandomValues(values)

      let userKey: string = ''
      for (let value of values) {
        userKey = userKey + value.toString()
      }

      let userId = await window.crypto.randomUUID()

      let response = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/create_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          userKey
        })
      })

      if (response.status !== 204) {
        message = 'Login failed! Try refreshing this page or clearing localStorage.'
        console.log(await response.text())
        return
      } else {
        window.localStorage.setItem('userId', userId)
        window.localStorage.setItem('userKey', userKey)
      }
    } else {
      let response = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/confirm_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: window.localStorage.getItem('userId'),
          userKey: window.localStorage.getItem('userKey')
        })
      })

      if (response.status !== 204) {
        message = 'Login failed! Try refreshing this page or clearing localStorage.'
        console.log(await response.text())
        return
      }
    }

    if (window.location.hash) {
      goto(window.location.hash)
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
