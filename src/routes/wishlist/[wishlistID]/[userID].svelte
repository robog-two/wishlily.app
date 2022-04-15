<script lang="ts">
  import { page } from '$app/stores'
  const { wishlistID, userID } = $page.params
  let wishlist

  import { onMount } from 'svelte'
  let itemURL = ''
  let isLoggedIn = false

  onMount(async () => {
    isLoggedIn = (userID === window.localStorage.getItem('userID'))

    const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/list_wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wishlistID,
        userID
      })
    })
    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      console.log(await dbResponse.json())
      return
    }
    wishlist = await dbResponse.json()
  })
</script>

{#if isLoggedIn}
  <input bind:value="{itemURL}" />
  <button on:click="{() => {
    window.location.replace(`/wishlist/${wishlistID}/addItem?url=${encodeURIComponent(itemURL)}`)
  }}">Add Item</button>
  <br />
{/if}

{#if wishlist}
  {#each wishlist as wish}
    <img src="{wish.cover}" alt="{wish.title}" />
    <p>{wish.title}</p>
    <h3>{wish.price}</h3>
  {/each}
{/if}
