<script>
  import { onMount } from "svelte";
  import QR from 'svelte-qr'
  let userId, userKey, encryptionKey

  onMount(() => {
    userId = window.localStorage.getItem('userId')
    userKey = window.localStorage.getItem('userKey')
    encryptionKey = window.localStorage.getItem('encryptionKey')
  })
</script>

<style lang="sass">
  h1, h2, a
    text-align: center
    display: block

  .qr-code
    display: block
    aspect-ratio: 1
    max-width: 300px
    margin-left: auto
    margin-right: auto
</style>

<h1>DO NOT GIVE THIS TO ANYONE.</h1>
<h2>This QR code allows anyone to login to your account at any time.<br/>It is for your use only.</h2>
{#if userId !== undefined && userKey !== undefined  && encryptionKey !== undefined }
  <div class="qr-code">
    <QR text="/user/import/#{userId}/{userKey}/{encryptionKey}" level="H" />
  </div>
{/if}
<a href="/user/import/#{userId}/{userKey}/{encryptionKey}">Or, copy this link.</a>
