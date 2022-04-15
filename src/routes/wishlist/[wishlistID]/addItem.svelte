<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  const { wishlistID } = $page.params

  onMount(async () => {
    const userID = window.localStorage.getItem('userID')
    const url = (new URLSearchParams(window.location.search)).get('url')

    const productResponse = await fetch(`https://proxy.wishlily.app/generic/product?id=${url}`)
    if (productResponse.status < 200 || productResponse.status >= 400) {
      console.log(await productResponse.text())
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
      return
    }

    window.location.replace(`/wishlist/${wishlistID}/${userID}`)
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
</style>

<h1>Adding item to your wishlist...</h1>
