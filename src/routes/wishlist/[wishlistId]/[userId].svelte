<script lang="ts">
  import { page } from '$app/stores'
  const { wishlistId, userId } = $page.params
  import logo from '../../../images/logo.svg'
  import deleteIcon from '../../../images/delete.svg'
  import { onMount } from 'svelte'
  import { checkLogin, decrypt } from '../../../scripts/keyMgmt';
import { goto } from '$app/navigation';

  const titleEmbed = decodeURIComponent($page.url.searchParams.get('s'))

  let wishlist
  let itemURL = ''
  let isLoggedIn = false
  let statusMessage
  let title, address, color

  onMount(async () => {
    isLoggedIn = (userId === await window.localStorage.getItem('userId'))

    if (isLoggedIn) {
      await checkLogin()
    }

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
    title = await decrypt(info.title)
    if (decodeURIComponent($page.url.searchParams.get('s')) !== title) {
      goto(`/wishlist/${wishlistId}/${userId}?s=${encodeURIComponent(title)}#${window.location.hash}`)
    }
    address = await decrypt(info.address)
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
    wishlist = (await dbResponse.json()).reverse()
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

<head>
  <title>{titleEmbed}</title>
  <meta property="og:title" content="{titleEmbed}" />
  <meta property="og:description" content="If you're thinking of me, look no further!" />
  <meta property="twitter:image" content="https://proxy.wishlily.app/embed?wishlistId={wishlistId}&userId={userId}" />
  <meta property="og:image" content="https://proxy.wishlily.app/embed?wishlistId={wishlistId}&userId={userId}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wishlily.app/{wishlistId}/{userId}" />
</head>

<style lang="sass">
  .wrapper
    width: calc(100% - 30px)
    min-height: calc(100vh - 80px)
    padding: 40px 15px 40px 15px

  .center
    margin: 0 auto 0 auto
    max-width: 425px

  .lily
    aspect-ratio: 1.149
    width: 64px
    margin: 0 auto 0 auto
    display: block

  .floaty-status
    top: 20px
    left: 20px
    position: fixed
    display: block
    border-radius: 5px
    width: calc(100% - 40px)
    line-height: 40px
    font-size: 25px
    font-family: 'Readex Pro', sans-serif
    background-color: black
    color: white
    text-align: center

  .list-title
    font-family: 'Readex Pro', sans-serif
    font-size: 25pt
    font-weight: normal
    margin: 7px 0 0 0
    text-align: center

  .address
    font-family: 'Space Grotesk', sans-serif
    font-weight: bold
    font-size: 11pt
    margin-top: 0
    text-align: center

  .wish
    border-radius: 30px
    background-color: white
    filter: drop-shadow(1px 3px 1.5px black)
    display: block
    overflow: hidden
    margin-bottom: 20px

  .wish-cover
    border-top-left-radius: 30px
    border-top-right-radius: 30px
    width: 100%
    height: auto

  .corset
    height: 0

  .padder
    width: 100%
    aspect-ratio: 2

  .floaty-tags
    display: flex
    flex-direction: row-reverse
    padding-top: 15px
    padding-right: 10px

  .floaty-tags span
    border-radius: 25px
    height: 25px
    line-height: 25px
    padding-left: 10px
    padding-right: 10px
    margin-right: 10px
    background-color: white

  .floaty-tags span img
    height: 80%
    width: auto
    margin-top: 10%

  .wish-title
    text-decoration: none
    color: black
    margin: 0
    padding: 10px 25px 10px 25px
    font-size: 20px
    text-align: center
    font-family: 'Space Grotesk', sans-serif
    font-weight: 600
    display: block
</style>

<div class="wrapper" style="background-color: {color}">
  <div class="center">
    {#if statusMessage}
      <span class="floaty-status">{ statusMessage ?? '' }</span>
    {/if}

    <a class="" href="/dashboard">
      <img class="lily" src="{logo}" alt="Back to home" />
    </a>

    {#if title}
      <h1 class="list-title">{title}</h1>
    {/if}

    {#if address}
      <h3 class="address">{address}</h3>
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
        <div class="wish">
          <div class="corset">
            <a href="{wish.link}">
              <img class="wish-cover" src="{wish.cover}" alt="{wish.title}" />
            </a>
          </div>
          <div class="corset">
            <div class="floaty-tags">
              {#if isLoggedIn}
                <span on:click="{() => {deleteProduct(wish.id)}}">
                  <img class="delete-icon" src={deleteIcon} alt="Delete"/>
                </span>
              {/if}
              <span>{wish.price}</span>
              {#if wish.link.includes('amazon.com')}
                <span>Amazon</span>
              {/if}
              {#if wish.link.includes('etsy.com')}
                <span>Etsy</span>
              {/if}
            </div>
          </div>
          <div class="padder"></div>
          <a class="wish-title" href="{wish.link}">
            {wish.title}
          </a>
        </div>
      {/each}
    {/if}
  </div>
</div>
