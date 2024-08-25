<script lang="ts">
  import { goto, prefetch } from '$app/navigation'
  import { onMount } from 'svelte';
  import embed from '../images/embed.png'
  import brain from '../images/brainscan.gif'
  import swishes from '../images/swishes.svg'

  let showStuff = false
  let doGlitch = false
  let fakeLog = ['']
  const fakeLogFull = 'Enabling EMOTION_ENGINE|Integrating ExiTel(TM) OPC_ram storage technology...|Calculating desire matrix (0%)|Calculating desire matrix (36%)|Calculating desire matrix (58%)|Calculating desire matrix (62%)|Calculating desire matrix (69%)|Calculating desire matrix (85%)|Calculating desire matrix (97%)|Synthesizing 5-flupentisol trio-ethylanalate...|Engaging injection arm...|Initiating consciousness distillation sequence|Conscious Release [==>                    ]|Conscious Release [=====>                 ]|Conscious Release [=======>               ]|WARNING > PAIN ABOVE THRESHHOLD, RECEPTORS INHIBITED|Conscious Release [=======>               ]|Conscious Release [============>          ]|Conscious Release [===============>       ]|Conscious Release [=====================> ]|WARNING > APPROACHING HIGHER DIMENSIONAL THOUGHT|Compensating. Activating additional coprocessors: 618 to 36916|Conscious Release [=======================] Done!|Brain shutting down (Note: Consciousness is now unrecoverable.)|Distilling desire...........Analysis Complete!|Rebooting....Memory Recovery Initiated.......Conscious Flow Initialized|'
  let fakeLogIndex = 0

  onMount(async () => {
    if (window.location.hash !== '#no-auto-login') {
      goto('/login')
      //if (window.localStorage.getItem('userId')) {
      //  goto('/login')
      //}
    }

    const logInterval = setInterval(() => {
      while (!['|', '.'].includes(fakeLogFull.charAt(fakeLogIndex))) {
        fakeLog[fakeLog.length-1] += fakeLogFull.charAt(fakeLogIndex)
        fakeLogIndex++
      }
      if (fakeLogFull.charAt(fakeLogIndex) === '|') {
        fakeLog.push('')
      } else {
        fakeLog[fakeLog.length-1] += '.'
      }
      fakeLogIndex++

      if (fakeLog.length > 25) {
        doGlitch = true
      }

      if (fakeLogIndex >= fakeLogFull.length) {
        clearInterval(logInterval)
        showStuff = true
      }
    }, 30)
  })
</script>

<svelte:head>
  <title>WISHLILY</title>
  <meta property="og:title" content="WISHLILY" />
  <link rel="icon" href="/favicon.png" sizes="any" type="image/png" />
  <meta property="og:description" content="SHOP WITHOUT IMPULSE. aggregate, organize & save for later" />
  <meta name="description" content="SHOP WITHOUT IMPULSE. aggregate, organize & save for later" />
  <meta property="twitter:image" content="{embed}" />
  <meta property="og:image" content="{embed}" />
  <meta property="og:type" content="website" />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:site_name" content="WISHLILY" />
  <meta property="og:url" content="https://wishlily.app/" />
  <meta name="theme-color" content="#190014" />
</svelte:head>

<style lang="sass">
  .wrapper
    background-color: #190014
    color: #ffefef
    width: calc(100% - 30px)
    min-height: calc(100vh - 80px)
    padding: 40px 15px 40px 15px

  .frontprint-wrap
    height: calc(100vh - 40px)

  .large
    font-family: 'Readex Pro', sans-serif
    font-size: 220px
    text-align: center
    margin-bottom: -60px
    animation: 0.3s glitch 1 step-start

  @keyframes glitch
    10%
      transform: translate(10px, 0px)
      color: #acfc29
    50%
      transform: translate(4px, -10px)
      color: #fc2992
    60%
      transform: translate(6px, -11px)
      color: #acfc29
    80%
      transform: translate(-7px, -13px)
      color: #29fcf1
    100%
      transform: none
      color: #ffefef

  .cta1
    font-family: 'Abril Fatface', serif
    font-size: 85px
    text-align: center
    margin-top: 0
    margin-bottom: 45px

  .brain-margin img
    width: 20vh
    max-width: 80vw
    margin-left: auto
    margin-right: auto
    display: block

  .brain img
    width: 60vh
    max-width: 80vw
    margin-left: auto
    margin-right: auto
    display: block
    margin-bottom: -60vh

  // .brain
  //   padding-right: 80px

  .brain-margin
    padding-top: 20vh

  .console
    font-family: 'Space Mono', monospace
    position: fixed
    top: 20px
    left: 20vw

  .glitch
    animation: 0.5s glitch 1 step-start

  .swishes
    display: block
    margin-left: auto
    margin-right: auto
    width: 500px

  .login
    color: #190014
    font-family: 'Space Grotesk', sans-serif
    line-height: 1rem
    margin-bottom: -16px
    font-size: 20px
    transform: translate(1px, 50px) rotate(90deg)
    text-align: center
    text-decoration: none
    display: block
</style>

<div class="wrapper" style="{showStuff ? '' : 'padding: 0; width: 100vw; height: 100vh'}">
  <div class="frontprint-wrap">
    {#if showStuff}
      <div class="brain">
        <img alt="Spinning low-poly brain scan simulation in a retro style" src="{brain}"/>
      </div>
      <h1 class="large">WISHLILY</h1>
      <h2 class="cta1">DISTILL YOUR DESIRE</h2>
      <a href="/login" class="login">Login</a>
      <img class="swishes" alt="three colored lines swooping downward" src="{swishes}" />
    {:else}
      <h2 class="cta1">SCANNING CONSCIOUSNESS</h2>
      <div class="brain-margin">
        <img alt="Spinning low-poly brain scan simulation in a retro style" src="{brain}"/>
      </div>
      <p class="console{doGlitch ? ' glitch' : ''}">
        {#each fakeLog as item}
          {item}
          <br/>
        {/each}
      </p>
    {/if}
  </div>
  {#if showStuff}
    <br />
    <!-- Put the additional content here -->
  {/if}
</div>
