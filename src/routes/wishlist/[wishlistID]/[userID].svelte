<script lang="ts">
  import { page } from '$app/stores'
  const { wishlistID, userID } = $page.params
  let wishlist

  import { onMount } from 'svelte'
  let itemURL = ''
  let isLoggedIn = false
  let statusMessage

  onMount(async () => {
    isLoggedIn = (userID === await window.localStorage.getItem('userID'))
    reloadWishlist()
  })

  async function reloadWishlist() {
    statusMessage = 'Loading ...'
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
    console.log(wishlist)
    statusMessage = undefined
  }

  async function addProduct() {
    const itemURLTemp = itemURL
    itemURL = undefined
    statusMessage = 'Adding item...'
    const productResponse = await fetch(`https://proxy.wishlily.app/generic/product?id=${encodeURIComponent(itemURLTemp)}`)
    if (productResponse.status < 200 || productResponse.status >= 400) {
      console.log(await productResponse.text())
      statusMessage = 'Error parsing item.'
      return
    }
    const product = await (productResponse).json()

    const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/add_item_to_wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wishlistID,
        userID,
        userKey: window.localStorage.getItem('userKey'),
        ...product
      })
    })
    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      console.log(await dbResponse.text())
      statusMessage = 'Error adding item.'
      return
    }

    statusMessage = undefined
    reloadWishlist()
  }

  async function deleteProduct(productId) {
    console.log(productId)
    statusMessage = 'Deleting item...'

    const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/delete_item_from_wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wishlistID,
        userID,
        userKey: window.localStorage.getItem('userKey'),
        id: productId
      })
    })
    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      console.log(await dbResponse.text())
      statusMessage = 'Error deleting item.'
      return
    }

    statusMessage = undefined
    reloadWishlist()
  }
</script>

{#if statusMessage}
  <span>{ statusMessage ?? '' }</span>
{/if}

{#if isLoggedIn}
  <form on:submit="{addProduct}" action="#">
    <span>Add Product:</span>
    <input bind:value="{itemURL}" />
    <input type="submit" style="display: none" />
  </form>
{/if}

{#if wishlist}
  {#each wishlist as wish}
    {#if isLoggedIn}
      <button on:click="{() => {deleteProduct(wish.id)}}">Delete</button>
    {/if}
    <a href="{wish.link}">
      <span>{wish.price}</span>
      {#if wish.link.includes('amazon.com')}
        <span>Amazon</span>
      {/if}
      {#if wish.link.includes('etsy.com')}
        <span>Etsy</span>
      {/if}
      <img src="{wish.cover}" alt="{wish.title}" />
      <p>{wish.title}</p>
    </a>
  {/each}
{/if}
