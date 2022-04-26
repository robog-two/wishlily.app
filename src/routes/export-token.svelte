<script>
  import { onMount } from "svelte";
  let userId, userKey, encryptionKey

  onMount(() => {
    userId = window.localStorage.getItem('userId')
    userKey = window.localStorage.getItem('userKey')
    encryptionKey = window.localStorage.getItem('encryptionKey')
  })
</script>

<h1>DO NOT GIVE THIS TO ANYONE.</h1>
<h3>WishLily will never ask for your token. You should not transfer your token, only store it for backup purposes.</h3>


<p><strong>User Id: </strong>{userId}</p>
<p><strong>User Token: </strong>{userKey}</p>
<p><strong>Encryption Key: </strong>{encryptionKey}</p>
