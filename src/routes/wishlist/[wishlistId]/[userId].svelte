<script lang="ts">
  import { page } from '$app/stores'
  const { wishlistId, userId } = $page.params
  import logo from '../../../images/logo.svg'
  let wishlist

  import { onMount } from 'svelte'
  let itemURL = ''
  let isLoggedIn = false
  let statusMessage
  let title, address, color

  onMount(async () => {
    isLoggedIn = (userId === await window.localStorage.getItem('userId'))
    loadWishlistInfo()
    reloadWishlist()
  })

  async function loadWishlistInfo() {
    statusMessage = 'Loading ...'
    const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/get_wishlist_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wishlistId,
        userId
      })
    })
    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      statusMessage = 'Error loading wishlist information!'
      console.log(await dbResponse.json())
      return
    }
    const info = await dbResponse.json()
    title = info.title
    address = info.address
    color = info.color
    console.log(wishlist)
    statusMessage = (statusMessage === 'Loading ...') ? undefined : statusMessage
  }

  async function reloadWishlist() {
    statusMessage = 'Loading ...'
    const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/list_wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wishlistId,
        userId
      })
    })
    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      statusMessage = 'Error loading wishlist!'
      console.log(await dbResponse.json())
      return
    }
    wishlist = await dbResponse.json()
    console.log(wishlist)
    statusMessage = (statusMessage === 'Loading ...') ? undefined : statusMessage
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
        wishlistId,
        userId,
        userKey: window.localStorage.getItem('userKey'),
        ...product
      })
    })
    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      console.log(await dbResponse.text())
      statusMessage = 'Error adding item.'
      return
    }

    statusMessage = (statusMessage === 'Adding item...') ? undefined : statusMessage
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
        wishlistId,
        userId,
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
    return false
  }
</script>

<div style="background-color: {color}">
  {#if statusMessage}
    <span>{ statusMessage ?? '' }</span>
  {/if}

  <a href="/dashboard">
    <img src="{logo}" alt="Back to home" />
  </a>

  {#if title}
    <h1>{title}</h1>
  {/if}

  {#if address}
    <h3>{address}</h3>
  {/if}

  {#if isLoggedIn}
    <form on:submit|preventDefault="{addProduct}">
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
</div>
