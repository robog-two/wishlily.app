<script lang="ts" context="module">
  import embed from '../images/embed.png'
</script>

<script lang="ts">
  import { goto } from '$app/navigation'
  import { checkLogin, decrypt, encrypt } from '../scripts/keyMgmt'
  import { onMount } from 'svelte'
  import logo from '../images/logo_large_format.svg'
  import deleteIcon from '../images/delete.svg'
  import cta from '../images/cta_no_wishlists.svg'
  import editIcon from '../images/edit.svg'
  import addIcon from '../images/plus.svg'

  let statusMessage
  let wishlists
  let listName, listAddress
  let listColor = '#000000'
  let addPage = 0
  let editingId = undefined

  let colors = [
    ['#fae36b', '#bca8e3', '#cdf39e', '#bbdef0', '#fdc4dd'],
    ['#fdab1c', '#7843ed', '#00a6a6', '#3086ed', '#e9424e'],
    ['#a54200', '#5023a3', '#3f826d', '#2b4570', '#811d19']
  ]

  let cache

  onMount(async () => {
    checkLogin()
    try {
      cache = await window.caches?.open('wishlily_cache')
    } catch (e) { console.log(e) }
    statusMessage = 'Loading ...'

    const isReload = (window.performance.navigation && window.performance.navigation.type === 1) ||
    window.performance
      .getEntriesByType('navigation')
      .map((nav) => nav.entryType)
      .includes('reload')
    reloadWishlists(!isReload)
  })

  async function reloadWishlists(useCache: boolean = false) {
    const request = new Request('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/list_wishlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: window.localStorage.getItem('userId'),
        userKey: window.localStorage.getItem('userKey')
      })
    })

    // If we're allowed to use the cache, use it!
    const cacheName = `wishlists_${window.localStorage.getItem('userId')}`
    const cached = useCache ? await cache?.match(cacheName) : undefined
    console.log(useCache && cache ? 'Using cache' : 'Fetching...')

    const dbResponse = cached ?? await fetch(request)

    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      statusMessage = 'Error loading wishlists!'
      console.log(await dbResponse.json())
      return
    }

    const tempWishlists = await dbResponse.clone().json()
    wishlists = [...tempWishlists]

    console.log(tempWishlists)
    statusMessage = undefined

    // If the cache wasn't there, or we were forced to load it anew, store it!
    if (cached === undefined) {
      cache.put(cacheName, dbResponse)
    }
  }

  async function addWishlist() {
    statusMessage = 'Saving wishlists...'

    const tempListName = listName
    const tempListColor = listColor
    const tempListAddress = listAddress
    const tempEditingId: string | undefined = editingId

    // Close the create wishlist screen
    cancelCreation()

    const body = {
      id: tempEditingId,
      userId: window.localStorage.getItem('userId'),
      userKey: window.localStorage.getItem('userKey'),
      title: await encrypt(tempListName),
      color: tempListColor,
      address: tempListAddress === undefined ? undefined : await encrypt(tempListAddress)
    }

    console.log(body)

    if (tempEditingId) {
      await wishlists.forEach(it => {
        if (it.id === tempEditingId) {
          it.color = tempListColor
          it.address = tempListAddress
          it.title = tempListName
        }
      })

      // Svelte update
      wishlists = [...wishlists]
    }

    console.log(wishlists)

    const dbResponse = await fetch(`https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/${tempEditingId ? 'edit_wishlist' : 'create_wishlist'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      statusMessage = JSON.parse((await dbResponse.json())?.error)?.message ?? 'Error saving wishlist.'
      return
    }

    if (tempEditingId === undefined) {
      // Once we've saved the wishlist to DB, it's valid to use as a link! We don't need to wait until reload.
      wishlists.push({
        title: body.title,
        color: body.color,
        address: body.address
      })
    }

    statusMessage = undefined
    // Reload to cache new wishlists for future use.
    reloadWishlists(false)
  }

  function incrPage() {
    if (addPage === 1 && listName === undefined) {
      statusMessage = 'You must name your list.'
    }

    if (addPage === 3 && listColor === '#000000') {
      statusMessage = 'You must select a color.'
    }

    if ((addPage !== 1 || listName) && (addPage !== 3 || (listColor && listColor !== '#000000'))) {
      addPage++
      const checkExist = setInterval(async () => {
        const textbox = (document.getElementById('searchbox-text') as HTMLInputElement)
        if (textbox) {
          clearInterval(checkExist)
          textbox.focus()
          textbox.select()
        }
      }, 100);
    }
  }

  function needsInvert(color: string): boolean {
    const c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const shade = (parseInt(c[1],16)+parseInt(c[2], 16)+parseInt(c[3], 16))/3

    if (shade >= 180) {
      return false
    } else {
      return true
    }
  }

  async function deleteWishlist(id) {
    if (!confirm('Are you sure you want to delete this wishlist?')) return
    statusMessage = 'Deleting wishlist...'
    const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/delete_wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: window.localStorage.getItem('userId'),
        userKey: window.localStorage.getItem('userKey'),
        wishlistId: id
      })
    })
    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      statusMessage = 'Error deleting wishlist!'
      console.log(await dbResponse.json())
      throw new Error('')
    }

    statusMessage = undefined
    reloadWishlists(false)
  }

  async function editWishlist(id) {
    editingId = id
    const list = await wishlists.find(it => {
      return it.id === id
    })
    console.log(list)
    listAddress = await decrypt(list.address)
    listColor = list.color
    listName = await decrypt(list.title)
    incrPage()
  }

  async function cancelCreation() {
    listAddress = undefined
    listColor = undefined
    listName = undefined
    editingId = undefined
    addPage = 0
  }
</script>

<svelte:head>
  <title>WISHLILY</title>
  <meta property="og:title" content="WishLily Dashboard" />
  <link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
  <meta property="og:description" content="Find and share your dream products." />
  <meta name="description" content="Find cheap products across shopping sites and save them for later, or share them with friends." />
  <meta property="twitter:image" content="{embed}" />
  <meta property="og:image" content="{embed}" />
  <meta property="og:type" content="website" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:site_name" content="WISHLILY" />
  <meta property="og:url" content="https://wishlily.app/dashboard" />
  <meta name="theme-color" content="#ffffff" />
</svelte:head>

<style lang="sass">
  .wrapper
    width: calc(100% - 30px)
    min-height: calc(100vh - 80px)
    padding: 40px 15px 40px 15px

  .center
    margin: 0 auto 0 auto
    width: 100%
    max-width: 425px
    overflow-x: hidden

  .logo
    width: 50%
    margin: 20px auto 80px auto
    display: block

  .floaty-status
    z-index: 10
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

  .vignette
    z-index: 1
    width: 100vw
    height: 100vh
    top: 0
    left: 0
    position: fixed
    overflow-y: scroll
    padding: 0 15px 0 15px

  .vignette.searchbox
    padding: 0

  .add-item-container
    bottom: 0
    left: 0
    position: fixed
    width: 100vw
    height: 40px
    overflow: visible
    display: flex
    flex-direction: row-reverse

  .add-item
    width: 60px
    height: 60px
    margin-right: 20px
    margin-top: -35px

  .searchbox
    display: flex
    flex-direction: column-reverse

  .searchbox-text
    font-family: 'Space Grotesk', sans-serif
    font-weight: normal
    font-size: 30pt
    border: none
    background-color: black
    width: 100%
    border-radius: 20pt
    text-align: center
    color: #c2c2c2
    margin-bottom: 80px
    padding-left: 0
    padding-right: 0

  @media screen and (max-width: 425px)
    .searchbox-text
      border-radius: 0

  .searchbox span
    text-align: center
    display: block
    font-family: 'Readex Pro'
    font-size: 14pt
    margin-bottom: 5px

  .wishlist
    border: 2px solid #0000000e
    display: block
    text-decoration: none
    font-family: 'Space Grotesk', sans-serif
    font-weight: normal
    font-size: 30px
    line-height: 30px
    height: calc(50px)
    background-color: black
    width: calc(100% - 24px)
    overflow-x: hidden
    border-radius: calc(50px)
    text-align: left
    padding-left: 20px
    margin-bottom: 25px

  .wishlist[type="color"]
    width: 40px
    height: 40px

  .wishlist p
    margin: 0
    padding-top: 10px
    padding-bottom: 10px

  .close
    width: 100%
    height: 0
    display: flex
    flex-direction: row-reverse

  .close div
    width: 60px
    height: 30px
    transform: translate(-20px, 10px)
    background-color: none
    display: flex
    flex-direction: row

  .close div img
    width: 50%
    height: 100%
    display: inline-block

  .color-selector-outer
    display: flex
    flex-direction: row
    justify-content: center
    width: 100%

  .color-selector
    width: 20vw
    min-width: 320px

  .color-row
    display: flex
    flex-direction: row
    width: 100%
    margin-bottom: 20px

  .color-button
    aspect-ratio: 1 / 1
    width: calc(20% - 15px)
    margin-right: 20px
    border-radius: 100%

  .color-button:last-child
    margin-right: 0

  .color-button-chosen
    width: calc(20% - 39px)
    aspect-ratio: 1 / 1
    min-height: 0 // Safari
    border: 12px solid black

  @media screen and (max-width: 1600px)
    .color-button
      height: 48px // Safari
    .color-button-chosen
      height: 24.44px // Safari's aspect ratio impl is incomplete. Workaround
</style>

{#if statusMessage}
  <span class="floaty-status">{ statusMessage }</span>
{/if}

<div class="wrapper">
  <div class="center">
    <img class="logo" src="{logo}" alt="Wish Lily" />
    {#if wishlists && wishlists.length > 0}
      {#each wishlists as wishlist}
        {#await decrypt(wishlist.title)}
          Loading...
          {:then title}
          <a on:click|self="{() => {statusMessage = 'Opening...'}}" class="wishlist" href="{`/wishlist/${wishlist.id}/${window.localStorage.getItem('userId')}/${encodeURIComponent(title)}#${window.localStorage.getItem('encryptionKey')}`}" style="display: block; background-color: {wishlist.color}">
            <div class="close">
              <div style="background-color: {wishlist.color}">
                <img on:click|preventDefault="{() => {editWishlist(wishlist.id)}}" src="{editIcon}" style="{needsInvert(wishlist.color) ? 'filter: invert(100%)' : ''}" alt="Edit"/>
                <img on:click|preventDefault="{() => {deleteWishlist(wishlist.id)}}" src="{deleteIcon}" style="{needsInvert(wishlist.color) ? 'filter: invert(100%)' : ''}" alt="Delete"/>
              </div>
            </div>
            <p on:click|self="{() => {statusMessage = 'Opening...'}}" style="color: {needsInvert(wishlist.color) ? 'white' : 'black'}">
              {title}
            </p>
          </a>
        {/await}
      {/each}
    {:else}
      <img class="center" alt="Tap the plus to get started." src="{cta}">
    {/if}

    {#if addPage > 0}
      <div class="vignette searchbox" style="background-color: #fffffff3" on:click|self="{cancelCreation}">
        <div class="center">
          <form on:submit|preventDefault="{() => {incrPage(); if (addPage >= 4) {addWishlist()}}}" action="">
            {#if addPage === 1}
              <span>List Name:</span>
              <input id="searchbox-text" class="searchbox-text" placeholder="My Dream Gifts" bind:value="{listName}" />
            {:else if addPage === 2}
              <span>Address:</span>
              <input id="searchbox-text" class="searchbox-text" placeholder="Address (Optional)" bind:value="{listAddress}" />
            {:else}
              <span>Color:</span>
              <div class="color-selector-outer">
                <div class="color-selector">
                  {#each colors as colorRow}
                    <div class="color-row">
                      {#each colorRow as color}
                        <div aria-label="Color {color}" class='color-button{listColor === color ? ' color-button-chosen' : ''}' style="border-color: {color}; background-color: {listColor === color ? (needsInvert(listColor ?? '#000000') ? 'white' : 'black') : color}" on:click="{() => {listColor = color}}"></div>
                      {/each}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
            <br style="height: 20px"/>
            <input type="submit" class="searchbox-text" value="{editingId ? 'Update Wishlist' : 'Create'}" style="color: {needsInvert(listColor ?? '#000000') ? 'white' : 'black'}; background-color: {listColor ?? '#000000'}; {addPage >= 3 ? '' : 'display: none'}"/>
          </form>
        </div>
      </div>
    {:else}
      <div class="add-item-container" style="background: linear-gradient(0deg, #ffffffff 0%, #ffffff00 100%)">
        <img class="add-item" src="{addIcon}" alt="Create wishlist"  on:click="{incrPage}"/>
      </div>
    {/if}
  </div>
</div>
