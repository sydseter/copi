// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html"
import {Socket} from "phoenix"
import topbar from "topbar"
import {LiveSocket} from "phoenix_live_view"
import dragula from "dragula"

let Hooks = {}
Hooks.DragDrop = {
  mounted() {
    dragula([document.querySelector('#hand'), document.querySelector('#table')], {
      invalid: function (el, handle) {
        // Don't allow dragging cards off the table
        return el.className === 'card-player' || document.querySelector('#round-played');
      }
  }).on('drop', (element, target, source, sibling) => {
      if (target.id === 'table') {
        fetch('/api/games/' + element.dataset.game + '/players/' + element.dataset.player + '/card', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dealt_card_id: element.dataset.dealtcard
          })
        }).then(response => {
          console.log(response)
    
          if (response.ok) {
            return true;
          }
          else {
            // Need to cancel the drop here
            return false;
          }
        })
      }
    });
  }
}
let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {params: {_csrf_token: csrfToken}, hooks: Hooks})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", info => topbar.show())
window.addEventListener("phx:page-loading-stop", info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket
