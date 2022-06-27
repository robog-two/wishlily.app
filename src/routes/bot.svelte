<div class="wrapper">

  <h1>Hello human! My name is Mathilda, WishLily's robot friend! 👋</h1>
  <h2>If you're seeing this, that means someone wants to buy your stuff.</h2>

  <h3>Why are you contacting my server?</h3>

  <p>WishLily is yet-another wishlist app, with smart features to find our users the best prices and rich information about your store. We provide these services by reading publicly accessible open graph tags and Shopify information (where available) from your site roughly every 24 hours.</p>

  <h3>Cool but... what's in it for me?</h3>

  <p>WishLily provides several incentives for you to allow our robot friend. First, if we're scanning your site, that means someone has already added your product to their wishlist, and they plan to buy it! Second, every time you have a sale of 15% or more, we'll send waiting customers a notification to go and buy what you're selling. And finally, our robots are responsible and will direct our users to official, first-party sellers of your product where possible.</p>

  <p class="fine-print">Sometimes our information is wrong. Shoot us an email at support (at) wishlily [dot] app if Mathilda isn't finding your official store or embedding your products correctly, and we can work together to improve our stuff!</p>

  <h3>Okay, whatever. Just leave me alone please.</h3>

  <p>If you'd like our servers to leave you alone, simply add these lines to your robots.txt and we'll remove your embeds in around 24 hours:<p>

  <div class="code">
    User-Agent: Mathilda
    Disallow: /
  </div>

  <p class="fine-print">Note: Unless you disallow "/", we'll ignore your robots.txt, because parsing is expensive and our robot needs to be able to scan for all available information about your store, such as shipping costs.</p>
</div>

<style lang="sass">
  .wrapper
    display: block
    margin: 30px auto 50px auto
    padding: 0 10px 0 10px
    max-width: 450px

  h1, h2, h3
    font-family: 'Readex Pro'

  .code
    font-family: monospace
    font-size: 1.2em
    background-color: #010203
    color: #fafafa
    white-space: pre-line
    padding: 5px
    border-radius: 5px

  .fine-print
    color: #3c3c3c
    font-style: italic
    font-size: 0.6em
    font-weight: 200
    transition: 0.2s ease-in-out

  .fine-print:hover
    font-style: normal
    font-size: 0.9em
    font-weight: 600
</style>
