<script context="module">
  export async function load({ params, fetch, session, stuff }) {
    const { wishlistId, userId } = params
    const infoRequest = new Request(`${await domain('db')}/get_wishlist_info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://wishlily.app'
      },
      body: JSON.stringify({
        wishlistId,
        userId
      })
    })

    const itemsRequest = new Request(`${await domain('db')}/list_products_in_wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://wishlily.app'
      },
      body: JSON.stringify({
        wishlistId,
        userId
      })
    })

    const unifiedResponse = await Promise.all([fetch(infoRequest), fetch(itemsRequest)])
    const infoResponse = unifiedResponse[0]
    const itemsResponse = unifiedResponse[1]

    const unifiedJSON = await Promise.all([infoResponse.json(), itemsResponse.json()])
    const info = unifiedJSON[0]
    const items = unifiedJSON[1]

    const color = info.color.toString().toLowerCase()
    const realTitle = info.title
    const address = info.address
    const wishlist = items.reverse()

    return {
      props: { color, address, wishlist, realTitle },
      status: 200
    }
  }
</script>

<script lang="ts">
  import { page } from '$app/stores'
  const { wishlistId, userId, uriTitle } = $page.params
  import cta from '../../../../images/cta_no_items.svg'
  import logo from '../../../../images/logo.svg'
  import deleteIcon from '../../../../images/delete.svg'
  import repairingImg from '../../../../images/repairing.svg'
  import addIcon from '../../../../images/plus.svg'
  import { onMount } from 'svelte'
  import { checkLogin, decrypt } from '../../../../scripts/keyMgmt';
  import { domain } from '../../../../scripts/isdev';

  let title = decodeURIComponent(uriTitle)

  // From Server
  export let color: string, realTitle: string, address: string, wishlist

  const titleEmbed = decodeURIComponent($page.url.searchParams.get('s'))

  let itemURL = ''
  let addressDecrypted = false
  let isLoggedIn = false
  let addingItem = false
  let statusMessage: string
  let searchResults: any = undefined
  let repairing = false
  let chooseResult: Function | undefined = undefined
  let cancelSearch: Function | undefined = undefined
  let cache: Cache
  let socket: WebSocket
  let devicePixelRatio = 1

  onMount(async () => {
    isLoggedIn = (userId === await window.localStorage.getItem('userId'))

    if (isLoggedIn) {
      await checkLogin()
    }

    decryptWishlistInfo()
    cache = await window.caches?.open('wishlily_cache')

    devicePixelRatio = window.devicePixelRatio || 1

    // Open a websocket to refresh any changes made on another device
    socket = new WebSocket(`${await domain('db-ws')}/product-update-websocket`)
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({action: 'register', wishlistId, userId}))
      wishlist.forEach(wish => {
        socket.send(JSON.stringify({action: 'upgrade', wishlistId, userId, wishId: wish.id}))
      })
    })
    socket.addEventListener('message', async (event: MessageEvent) => {
      const message = JSON.parse(event.data)
      switch(message.action) {
        case 'reload':
          // Reload without the cache
          reloadWishlist(false)
          break;
        case 'replace-embed':
          // Replace the embed with the new one
          const embed = message.embed
          for (let i = 0; i < wishlist.length; i++) {
            if (wishlist[i].id === embed.id) {
              wishlist[i] = embed
              break;
            }
          }
          break;
      }
    })
  })

  async function decryptWishlistInfo() {
    title = await decrypt(realTitle)
    address = (address === undefined) ? undefined : await decrypt(address)
    addressDecrypted = true
  }

  async function reloadWishlist(useCache: boolean = false) {
    const request = new Request(`${await domain('db')}/list_products_in_wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://wishlily.app'
      },
      body: JSON.stringify({
        wishlistId,
        userId
      })
    })

    // If we're allowed to use the cache, use it!
    const cacheName = `wishlistitems_${wishlistId}_${userId}`
    const cached = useCache ? await cache?.match(cacheName) : undefined

    const dbResponse = cached ?? await fetch(request)

    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      statusMessage = 'Error loading wishlist!'
      console.log(await dbResponse.json())
      return
    }
    wishlist = (await dbResponse.clone().json()).reverse()

    // If the cache wasn't there, or we were forced to load it anew, store it!
    if (cached === undefined) {
      cache.put(cacheName, dbResponse)
    }
  }

  async function search(query: string): Promise<any> {
    const productResponse = await fetch(`${await domain('mathilda')}/generic/search?q=${encodeURIComponent(query)}`)
    if (productResponse.status < 200 || productResponse.status >= 400) {
      statusMessage = 'Error parsing search results.'
      console.log(await productResponse.json())
      return
    }
    searchResults = (await productResponse.json()).message
    statusMessage = undefined

    return new Promise((resolve, reject) => {
      chooseResult = (result) => {
        resolve(result)
        searchResults = undefined
        cancelSearch = undefined
        chooseResult = undefined
        addingItem = false
      }

      cancelSearch = () => {
        reject()
        cancelSearch = undefined
        chooseResult = undefined
        statusMessage = undefined
        searchResults = undefined
        addingItem = false
      }
    })
  }

  async function addProduct() {
    let itemURLTemp = itemURL
    addingItem = false
    itemURL = undefined
    statusMessage = 'Searching...'

    const matches = itemURLTemp.match(/https?:\/\/(?:[a-z0-9\-_ßàÁâãóôþüúðæåïçèõöÿýòäœêëìíøùîûñé]*[a-z][a-z0-9\-_ßàÁâãóôþüúðæåïçèõöÿýòäœêëìíøùîûñé]*\.[a-z0-9.\-_ßàÁâãóôþüúðæåïçèõöÿýòäœêëìíøùîûñé]+|[a-z0-9\-_ßàÁâãóôþüúðæåïçèõöÿýòäœêëìíøùîûñé]+\.[a-z0-9\-_ßàÁâãóôþüúðæåïçèõöÿýòäœêëìíøùîûñé]*[a-z][a-z0-9\-_ßàÁâãóôþüúðæåïçèõöÿýòäœêëìíøùîûñé]*)(?:\/[a-z0-9\-._~:/?#\[\]@!\$&'\(\)\*\+;%=]+|\/?)/ig)
    if (!matches || matches.length === 0) {
      itemURLTemp = (await search(itemURLTemp)).link
    } else {
      itemURLTemp = matches[0]
    }

    const dbResponse = await fetch(`${await domain('db')}/add_item_to_wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://wishlily.app'
      },
      body: JSON.stringify({
        wishlistId,
        userId,
        userKey: window.localStorage.getItem('userKey'),
        link: itemURLTemp
      })
    })
    addingItem = false
    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      console.log(await dbResponse.json())
      statusMessage = 'Error adding item.'
      return
    }

    wishlist.push((await dbResponse.json()).embed)

    statusMessage = (statusMessage === 'Searching...') ? undefined : statusMessage

    // Then, re-cache the wishlist
    reloadWishlist(false)
    // and tell our friends
    socket?.send(`${wishlistId},${userId}|reload`)
  }

  async function deleteProduct(productId) {
    statusMessage = 'Deleting item...'

    const dbResponse = await fetch(`${await domain('db')}/delete_item_from_wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://wishlily.app'
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
    // Reload without cache & tell our friends
    reloadWishlist(false)
    socket?.send(`${wishlistId},${userId}|reload`)
    return false
  }

  function startSearch() {
    addingItem = true
    const checkExist = setInterval(async () => {
      const textbox = (document.getElementById('searchbox-text') as HTMLInputElement)
      if (textbox) {
        clearInterval(checkExist)
        textbox.focus()
        textbox.select()
      }
    }, 100);
  }

  function needsInvert(c2: string): boolean {
    if (c2 === undefined) return false
    const c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c2);
    const shade = (parseInt(c[1],16)+parseInt(c[2], 16)+parseInt(c[3], 16))/3

    if (shade >= 180) {
      return false
    } else {
      return true
    }
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta property="og:title" content="{title}" />
  <link rel="icon" href="/color/${color.slice(1)}.png" sizes="any" type="image/png" />
  <link rel="icon" href="/user/icon/{color.slice(1)}" sizes="any" type="image/svg+xml" />
  <meta property="og:description" content="If you're thinking of me, look no further!" />
  <meta name="description" content="Find cheap products across shopping sites and save them for later. Share your dreams on WishLily." />
  <meta property="twitter:image" content="https://proxy.wishlily.app/embed?wishlistId={wishlistId}&userId={userId}" />
  <meta property="og:image" content="https://proxy.wishlily.app/embed?wishlistId={wishlistId}&userId={userId}" />
  <meta property="og:type" content="website" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:site_name" content="WISHLILY" />
  <meta property="og:url" content="https://wishlily.app/{wishlistId}/{userId}/{encodeURIComponent(title)}" />
  <meta name="theme-color" content="{color}" />
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
    z-index: 50

  .list-title
    font-family: 'Readex Pro', sans-serif
    font-size: 25pt
    font-weight: normal
    margin: 7px 0 0 0
    text-align: center
    margin-top: -10px
    margin-bottom: 5px

  .address
    font-family: 'Space Grotesk', sans-serif
    font-weight: bold
    font-size: 11pt
    margin-top: 0
    text-align: center
    margin-bottom: 0

  .wish
    border-radius: 30px
    background-color: white
    border-bottom: 2px solid #0000000e
    display: block
    overflow: hidden
    margin-bottom: 30px

  .wish-cover
    height: 200px
    width: auto
    margin-left: auto
    margin-right: auto
    display: block

  .cover-link
    overflow: hidden
    border-top-left-radius: 30px
    border-top-right-radius: 30px
    width: 100%
    display: block

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
    margin-top: 11%

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

  .vignette
    z-index: 1
    width: 100vw
    height: 100vh
    top: 0
    left: 0
    position: fixed
    overflow-y: scroll
    padding: 40px 15px 40px 15px

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

  .search-instructions
    text-align: center
    display: block
    font-family: 'Readex Pro'
    font-size: 14pt
    margin-bottom: 5px

  .wishes-container
    margin-top: 20px
</style>

<div style="color: {needsInvert(color) ? 'white' : 'black'}; background-color: {color}" class="wrapper">
  <div class="center" style="{searchResults !== undefined ? 'display: none' : ''}">
    {#if statusMessage}
      <span class="floaty-status">{(() => {
        const scopy = statusMessage
        setTimeout(() => {
          if (statusMessage === scopy) statusMessage = undefined
        }, 3000)
        return statusMessage
      })()}</span>
    {/if}

    <a class="" href="/dashboard">
      <img style="{needsInvert(color) ? 'filter: invert(100%)' : ''}" class="lily" src="{logo}" alt="Back to home" />
    </a>

    {#if title}
      <h1 class="list-title">{title}</h1>
    {/if}

    {#if address}
      {#if addressDecrypted}
        <h3 class="address">{address}</h3>
      {:else}
        <h3 class="address">Decrypting...</h3>
      {/if}
    {/if}

    {#if wishlist && wishlist.length > 0}
      <div class="wishes-container">
        {#each wishlist as wish}
          <div class="wish" style="color: black">
            <div class="corset">
              <a href="{wish.link}" class="cover-link">
                <img class="wish-cover" src="https://imagecdn.app/v2/image/{encodeURIComponent(wish.cover)}?height={200 * devicePixelRatio}&format=webp&fit=inside" alt="{wish.title}" />
              </a>
            </div>
            <div class="corset">
              <div class="floaty-tags">
                {#if isLoggedIn}
                  <span on:click="{() => {deleteProduct(wish.id)}}">
                    <img class="delete-icon" src={deleteIcon} alt="Delete"/>
                  </span>
                {/if}
                {#if wish.price}
                  <span>{wish.price}</span>
                {/if}
                {#if wish?.link?.includes('amazon.com')}
                  <span>Amazon</span>
                {/if}
                {#if wish?.link?.includes('etsy.com')}
                  <span>Etsy</span>
                {/if}
                {#if wish?.link?.includes('target.com')}
                  <span>Target</span>
                {/if}
                {#if wish?.link?.includes('walmart.com')}
                  <span>Walmart</span>
                {/if}
                {#if wish?.link?.includes('barnesandnoble.com')}
                  <span>Barnes & Noble</span>
                {/if}
                {#if wish?.link?.includes('bestbuy.com')}
                  <span>Best Buy</span>
                {/if}
              </div>
            </div>
            <div class="padder"></div>
            <a class="wish-title" href="{wish.link}">
              {wish.title}
            </a>
          </div>
        {/each}
      </div>
    {:else}
      <br />
      <br />
      <br />
      <img style="{needsInvert(color) ? 'filter: invert(100%)' : ''}" class="center" alt="Tap the plus to add a product." src="{cta}">
    {/if}

    {#if isLoggedIn && !addingItem}
      <div class="add-item-container" style="background: linear-gradient(0deg, {color}ff 0%, {color}00 100%)">
        <img style="{needsInvert(color) ? 'filter: invert(100%)' : ''}" class="add-item" src="{addIcon}" alt="Add new product"  on:click="{startSearch}"/>
      </div>
    {/if}
  </div>
  {#if searchResults}
    <div class="vignette" style="background-color: {color}f3" on:click|self="{cancelSearch()}">
      <div class="center" on:click|self="{cancelSearch()}">
      <span class="search-instructions">Touch an item to add.</span>
      {#each searchResults as result}
        <div class="wish" style="color: black">
          <div class="corset">
            <img on:click="{chooseResult(result)}" class="wish-cover" src="{`https://imagecdn.app/v2/image/${encodeURIComponent(result.cover)}?width=400&height=200&format=webp&fit=cover`}" alt="{result.title}" />
          </div>
          <div class="corset">
            <div class="floaty-tags">
              <span>{result.price}</span>
              {#if result.link.includes('amazon.com')}
                <span>Amazon</span>
              {/if}
              {#if result.link.includes('etsy.com')}
                <span>Etsy</span>
              {/if}
              {#if result.link.includes('target.com')}
                <span>Target</span>
              {/if}
              {#if result.link.includes('walmart.com')}
                <span>Walmart</span>
              {/if}
              {#if result.link.includes('barnesandnoble.com')}
                <span>Barnes & Noble</span>
              {/if}
              {#if result.link.includes('bestbuy.com')}
                <span>Best Buy</span>
              {/if}
            </div>
          </div>
          <div class="padder"></div>
          <p class="wish-title" on:click|preventDefault="{chooseResult(result)}">
            {result.title}
          </p>
        </div>
      {/each}
      </div>
    </div>
  {:else if addingItem}
    <div class="vignette searchbox" style="background-color: {color}f3" on:click|self="{() => {addingItem = false; itemURL = ''}}">
      <div class="center">
        <form on:submit|preventDefault="{addProduct}">
          <span>Paste link or type search.</span>
          <input id="searchbox-text" style="color: {itemURL === '' || itemURL === undefined ? '#c2c2c2' : 'white'}" bind:value="{itemURL}" class="searchbox-text" placeholder="I wish for..." />
          <input type="submit" style="display: none" />
        </form>
      </div>
    </div>
  {/if}

  {#if repairing}
    <div class="vignette searchbox" style="background-color: #190014ff">
      <div class="center">
        <img src="{repairingImg}" alt="Repairing your links with Price AI">
        <h4>{statusMessage}</h4>
      </div>
    </div>
  {/if}
</div>
