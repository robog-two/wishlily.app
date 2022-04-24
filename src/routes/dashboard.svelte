<script lang="ts">
  import { goto } from '$app/navigation'
  import { checkLogin, decrypt, encrypt } from '../scripts/keyMgmt';
  import { onMount } from 'svelte';
  import logo from '../images/logo_large_format.svg';
  import deleteIcon from '../images/delete.svg';
  import addIcon from '../images/plus.svg'

  let statusMessage
  let wishlists
  let listName, listAddress
  let listColor = '#ffffff'
  let addPage = 0

  onMount(async () => {
    checkLogin()
    reloadWishlists()
  })

  async function reloadWishlists() {
    statusMessage = 'Loading ...'
    const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/list_wishlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: window.localStorage.getItem('userId'),
        userKey: window.localStorage.getItem('userKey')
      })
    })
    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      statusMessage = 'Error loading wishlists!'
      console.log(await dbResponse.json())
      return
    }

    wishlists = await dbResponse.json()

    console.log(wishlists)
    statusMessage = undefined
  }

  async function addWishlist() {
    statusMessage = 'Creating wishlist...'

    const tempListName = listName
    listName = undefined
    const tempListColor = listColor
    listColor = undefined
    const tempListAddress = listAddress
    listAddress = undefined

    const body = {
      userId: window.localStorage.getItem('userId'),
      userKey: window.localStorage.getItem('userKey'),
      title: await encrypt(tempListName),
      color: tempListColor,
      address: tempListAddress === undefined ? undefined : await encrypt(tempListAddress)
    }

    console.log(body)

    const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/create_wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (dbResponse.status < 200 || dbResponse.status >= 400) {
      statusMessage = JSON.parse((await dbResponse.json())?.error)?.message ?? 'Error creating wishlist.'
      return
    }

    statusMessage = undefined
    reloadWishlists()
    return false
  }

  function incrPage() {
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

  function needsInvert(color: string): boolean {
    const c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const shade = (parseInt(c[1],16)+parseInt(c[2], 16)+parseInt(c[3], 16))/3

    if (shade >= 128) {
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
    reloadWishlists()
  }
</script>

<style lang="sass">
  .wrapper
    width: calc(100% - 30px)
    min-height: calc(100vh - 80px)
    padding: 40px 15px 40px 15px

  .center
    margin: 0 auto 0 auto
    max-width: 425px

  .logo
    width: 50%
    margin: 20px auto 80px auto
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

  .vignette
    z-index: 1
    width: 100vw
    height: 100vh
    top: 0
    left: 0
    position: fixed
    overflow-y: scroll

  .vignette .center
    padding-top: 100px
    padding-bottom: 40px

  .add-item-container
    bottom: 0
    left: 0
    position: fixed
    width: 100vw
    height: 40px
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
    font-size: 30pt
    line-height: 30pt
    height: 30pt
    background-color: black
    width: 100%
    border-radius: 20pt
    text-align: left
    padding-left: 20px
    margin-bottom: 25px

  .wishlist[type="color"]
    width: 40px
    height: 40px

  .wishlist p
    margin: 0

  .close
    width: 100%
    height: 0
    display: flex
    flex-direction: row-reverse

  .close div
    width: 25pt
    height: 25pt
    transform: translate(-5pt, 3pt)
    border-radius: 100%

  .close div img
    width: 100%
    height: 100%
    display: block
</style>

{#if statusMessage}
  <span class="floaty-status">{ statusMessage }</span>
{/if}

<div class="wrapper">
  <div class="center">
    <img class="logo" src="{logo}" alt="Wish Lily" />
    {#if wishlists}
      {#each wishlists as wishlist}
        {#await decrypt(wishlist.title)}
          Loading...
          {:then title}
          <a class="wishlist" href="{`/wishlist/${wishlist.id}/${window.localStorage.getItem('userId')}?s=${title}#${window.localStorage.getItem('encryptionKey')}`}" style="display: block; background-color: {wishlist.color}">
            <div class="close">
              <div style="background-color: {wishlist.color}">
                <img on:click|preventDefault="{() => {deleteWishlist(wishlist.id)}}" src="{deleteIcon}" style="{needsInvert(wishlist.color) ? 'filter: invert(100%)' : ''}" alt="Delete"/>
              </div>
            </div>
            <p style="color: {needsInvert(wishlist.color) ? 'white' : 'black'}">
              {title}
            </p>
          </a>
        {/await}
      {/each}
    {/if}

    {#if addPage > 0}
      <div class="vignette searchbox" style="background-color: #ffffffa0" on:click|self="{() => {addPage = 0}}">
        <div class="center">
          <form on:submit|preventDefault="{() => {incrPage(); if (addPage >= 4) {addPage = 0;addWishlist()}}}" action="">
            {#if addPage === 1}
              <span>List Name:</span>
              <input id="searchbox-text" class="searchbox-text" placeholder="My Dream Gifts" bind:value="{listName}" />
            {:else if addPage === 2}
              <span>Address:</span>
              <input id="searchbox-text" class="searchbox-text" placeholder="Address (Optional)" bind:value="{listAddress}" />
            {:else}
              <span>Color:</span>
              <input type="color" id="searchbox-text" class="searchbox-text" bind:value="{listColor}" />
            {/if}
            <br style="height: 20px"/>
            <input type="submit" class="searchbox-text" value="Create" style="{addPage >= 3 ? '' : 'display: none'}"/>
          </form>
        </div>
      </div>
    {:else}
      <div class="add-item-container" style="background: linear-gradient(0deg, #ffffffff 0%, #ffffff00 100%)">
        <img class="add-item" src="{addIcon}" alt="Add new product"  on:click="{incrPage}"/>
      </div>
    {/if}
  </div>
</div>
