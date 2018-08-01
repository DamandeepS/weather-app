import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import "@fabricelements/skeleton-carousel/skeleton-carousel.js";
import '@polymer/iron-image/iron-image.js';
import '../weather-view/weather-view.js';
import '../add-location/add-location.js';
import '@polymer/paper-fab/paper-fab.js'
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
        <add-location on-locations-updated="updateLocations" ></add-location>
        </skeleton-carousel>
        <paper-fab icon="add" on-click='addNewLocation'></paper-fab>
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

  updateLocations() {
    this.set('locations', JSON.parse(localStorage.getItem('locations')) || [])
  }

  addNewLocation() {
    this.$.carousel.selected = (this.locations.length);
  }


}

window.customElements.define('weather-app', WeatherApp);
