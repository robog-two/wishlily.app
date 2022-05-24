<script lang="ts">
  import { goto } from "$app/navigation";
  import { checkLogin, decrypt } from "../../scripts/keyMgmt";
  import { onMount } from "svelte";
  import { domain } from '../../scripts/isdev';

  let message = 'Please confirm to delete your data.'

  onMount(async () => {
    if (confirm('WARNING! Clearing data means that you will lose access to ALL of your wishlists, FOREVER. Press OK to clear all data.') === true) {
      message = 'Deleting data...'

      try {
        let dbResponse = await fetch(`${await domain('db')}/list_wishlists`, {
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
          message += 'Error loading wishlists!'
          console.log(await dbResponse.json())
          throw new Error('')
        }

        const wishlists = await dbResponse.json()
        console.log(wishlists)

        for (const wishlist of wishlists) {
          console.log(wishlist)
          dbResponse = await fetch(`${await domain('db')}/delete_wishlist`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: window.localStorage.getItem('userId'),
              userKey: window.localStorage.getItem('userKey'),
              wishlistId: wishlist.id
            })
          })
          if (dbResponse.status < 200 || dbResponse.status >= 400) {
            message += `Error deleting wishlist "${await decrypt(wishlist.title)}"!`
            console.log(await dbResponse.json())
            throw new Error('')
          }
        }
        message = "Deleting user information..."
      } catch (e) {
      }

      const dbResponse = await fetch(`${await domain('db')}/delete_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: window.localStorage.getItem('userId'),
          userKey: window.localStorage.getItem('userKey')
        })
      })
      window.localStorage.clear()
    }

    goto('/')
  })
</script>

<h1>{message}</h1>
