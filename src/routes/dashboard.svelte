<script lang="ts">
  import { goto } from '$app/navigation'
  import { checkLogin, encrypt } from '../scripts/keyMgmt';
  import { onMount } from 'svelte';

  let statusMessage
  let wishlists
  let listName, listAddress, listColor

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

      const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/create_wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: window.localStorage.getItem('userId'),
          userKey: window.localStorage.getItem('userKey'),
          title: tempListName,
          color: tempListColor,
          address: await encrypt(tempListAddress)
        })
      })
      if (dbResponse.status < 200 || dbResponse.status >= 400) {
        console.log(await dbResponse.text())
        statusMessage = 'Error creating wishlist.'
        return
      }

      statusMessage = undefined
      reloadWishlists()
      return false
    }
</script>

{#if statusMessage}
  <span>{ statusMessage }</span>
{/if}

<form on:submit|preventDefault="{addWishlist}" action="">
  <span>List Name:</span>
  <input bind:value="{listName}" />
  <span>Address:</span>
  <input bind:value="{listAddress}" />
  <span>Color:</span>
  <input bind:value="{listColor}" />
  <input type="submit" value="Create" />
</form>

{#if wishlists}
  {#each wishlists as wishlist}
    <a href="{`/wishlist/${wishlist.id}/${window.localStorage.getItem('userId')}#${window.localStorage.getItem('encryptionKey')}`}" style="display: block; background-color: {wishlist.color}">
      <p>{wishlist.title}</p>
    </a>
  {/each}
{/if}
