import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import "@fabricelements/skeleton-carousel/skeleton-carousel.js";
import '@polymer/iron-image/iron-image.js';
import '../weather-view/weather-view.js';
import '../add-location/add-location.js';
import '@polymer/paper-fab/paper-fab.js'
import '@polymer/paper-toast/paper-toast.js'
import '@polymer/iron-icons/maps-icons.js'
/**
 * @customElement
 * @polymer
 */
class WeatherApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        paper-fab {
          position: fixed;
          right: 40px;
          bottom: 40px;
        }
      </style>
        <skeleton-carousel id="carousel">

        <dom-repeat items="{{locations}}">
          <template>
            <weather-view on-locations-updated="updateLocations" location="[[item]]"></weather-view>
          </template>
        </dom-repeat>
        <add-location id="add" on-locations-updated="updateLocations" ></add-location>
        </skeleton-carousel>
        <paper-fab icon="add" id="fab" on-click='addNewLocation'></paper-fab>
        <paper-toast id="toast"></paper-toast>
    `;
  }
  static get properties() {
    return {
      locations: {
        type: Array,
        value: (()=> {
          return JSON.parse(localStorage.getItem('locations')) || []
        })()
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.$.carousel.addEventListener('selected-item-changed', e => {
      if(e.detail.value == this.$.add) {
        this.$.fab.icon = "maps:my-location";
        this.$.fab.style.backgroundColor= '#fff';
        this.$.fab.style.color="#000";
        if(this.$.carousel.selected != 0)
        this.$.add.focusInput();
      }
      else {
        this.$.fab.icon="add";
        this.$.fab.style.backgroundColor= 'var(--paper-pink-a200)';
        this.$.fab.style.color="#fff";
      }
    })
  }
  updateLocations(e) {
    this.set('locations', JSON.parse(localStorage.getItem('locations')) || []);
    console.log(e)
    const carousel = this.$.carousel,
          updatedItem = carousel.querySelector('weather-view[location-id="' + e.detail.updatedLocationId +'"]');
    if(updatedItem)
      while(carousel.selectedItem != updatedItem)
        carousel.prev();
  }

  addNewLocation() {
    if(this.$.carousel.selected != this.locations.length)
      this.$.carousel.selected = (this.locations.length);
    else {
      this.$.add.addCurrentLocation()
    }
  }


}

window.customElements.define('weather-app', WeatherApp);
