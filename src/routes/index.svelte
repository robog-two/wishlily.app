<script lang="ts">
  import { goto, prefetch } from '$app/navigation'
  import { onMount } from 'svelte';
  import embed from '../images/embed.png'

  onMount(async () => {
    prefetch('/login')
    if (window.localStorage.getItem('userId')) {
      goto('/login')
    }
  })
</script>

<svelte:head>
  <title>WISHLILY</title>
  <meta property="og:title" content="WishLily" />
  <link rel="icon" href="/user/icon/ffffff" sizes="any" type="image/svg+xml" />
  <meta property="og:description" content="Find and share your dream products." />
  <meta name="description" content="Find cheap products across shopping sites and save them for later, or share them with friends." />
  <meta property="twitter:image" content="{embed}" />
  <meta property="og:image" content="{embed}" />
  <meta property="og:type" content="website" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:site_name" content="WISHLILY" />
  <meta property="og:url" content="https://wishlily.app/" />
  <meta name="theme-color" content="#ffffff" />
</svelte:head>

<style>
  h1 {
    width: 100%;
    text-align: center;
    margin-top: 10vh;
    font-family: sans-serif;
  }

  p {
    width: 100%;
    text-align: center;
    font-family: sans-serif;
  }
</style>

<h1>WishLily is currently in Beta</h1>
<p>It's not easily accessible to the public just yet</p>
