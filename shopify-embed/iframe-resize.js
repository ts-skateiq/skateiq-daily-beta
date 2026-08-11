/**
 * Shopify theme snippet — paste into your theme's layout or page template.
 * Listens for height messages from the Skate IQ Games iframe and resizes it.
 *
 * Usage in theme liquid:
 *   <iframe id="skateiq-games" src="https://your-vercel-url.vercel.app" frameborder="0" scrolling="no" style="width:100%;border:none;"></iframe>
 *   {% javascript %}
 *     // paste this file's contents here
 *   {% endjavascript %}
 */

(function () {
  var iframe = document.getElementById('skateiq-games');
  if (!iframe) return;

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'skateiq-resize') {
      iframe.style.height = e.data.height + 'px';
    }
  });
})();
