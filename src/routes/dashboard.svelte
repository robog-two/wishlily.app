<script lang="ts">
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte';

  onMount(async () => {
    if (!window.localStorage.getItem('userId')) {
      goto('/')
    }
  })
</script>
