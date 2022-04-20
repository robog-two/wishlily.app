<script lang="ts">
  import { goto } from "$app/navigation";
import { decrypt } from "src/scripts/keyMgmt";
import { onMount } from "svelte";

  let message = 'Please confirm to delete your data.'

  onMount(async () => {
    if (prompt('WARNING! Clearing data means that you will lose access to ALL of your wishlists, FOREVER. Type "confirm" to clear all data.') === 'confirm') {
      message = 'Deleting data...'

      try {
        let dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/list_wishlists', {
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
          message = 'Error loading wishlists!'
          console.log(await dbResponse.json())
          return
        }

        const wishlists = await dbResponse.json()

        for (const wishlist of wishlists) {
          dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/delete_wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: window.localStorage.getItem('userId'),
              userKey: window.localStorage.getItem('userKey'),
              id: wishlist.id
            })
          })
          if (dbResponse.status < 200 || dbResponse.status >= 400) {
            message = `Error deleting wishlist "${await decrypt(wishlist.title)}"!`
            console.log(await dbResponse.json())
            return
          }
        }
        message = "Deleting user information..."
      } catch (e) {
        message = "Failed to clear all wishlists, continuing anyways."
      }

      const dbResponse = await fetch('https://data.mongodb-api.com/app/wishlily-website-krmwb/endpoint/delete_user', {
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
        message = `Error deleting user - Your wishlists and saved products have been deleted, but not your login information.`
        console.log(await dbResponse.json())
        return
      }

      window.localStorage.clear()
    }

    goto('/')
  })
</script>

<h1>{message}</h1>
