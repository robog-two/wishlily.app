<script lang="ts">
  import { goto, prefetch } from '$app/navigation'
  import { onMount } from 'svelte';

  onMount(async () => {
    prefetch('/login')
    if (window.localStorage.getItem('userId')) {
      goto('/login')
    }
  })
</script>

<style global>
  html {
    background-color: lightcoral;
  }

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
