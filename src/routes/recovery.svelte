<script lang="ts">
  import { onMount } from 'svelte'
  import { goto, prefetch } from '$app/navigation'
  import { Buffer } from 'buffer/index.js'

  let message = ''

  onMount(async () => {
    prefetch('/dashboard')

    const stuff = window.location.hash.slice(1).split('/')

    window.localStorage.setItem('encryptionKey', stuff[0])
    window.localStorage.setItem('userKey', stuff[1])
    window.localStorage.setItem('userId', stuff[2])

    goto('/dashboard')
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
