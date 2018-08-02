import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-image/iron-image.js';
/**
 * @customElement
 * @polymer
 */
class WeatherView extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          min-height: 100vh;
          background: #c73;
          color: #fff;
        }
        .top-banner {
          margin-top: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        :host([highlight^="8"]) {
          background: #8d86a9;
          color: #111;
        }

        :host([highlight="2"]) {
          background: #48424e;
        }
        :host([highlight^="3"]) {
          background: #234fa0;
        }
        :host([highlight^="5"]) {
          background: #001b69;
          color: #2fffd1;
        }
        :host([highlight^="6"]) {
          background: #ffffff;
          color: #0f114c;
        }
        :host([highlight="800"]) {
          background: #00b7ff;
          color: #fff;
        }
        :host([highlight^="7"]) {
          background: #d3d5d8;
          color: #3f3f44
        }


        .weather-main {
          margin: 10px auto 8px auto;
        }

        .weather-main + p {
          margin: 0 auto 30px auto;
        }

        paper-icon-button#delete {
          position: absolute;
          top: 0;
          right: 0;
          margin: 20px;
        }

        .my-location {
          bottom: 3px;
          padding: 5px;
        }

        .weather-icon {
          max-width: 400px;
          width: 55%;
        }

        .temprature-main {
          display: flex;
          width: 100%;
          max-width: 500px;
        }

        .temprature-main > div {
          flex-grow: 1;
        }

        .temprature-main > div p {
          font-size: 1.2em;
          font-weight: 100;
        }

        paper-icon-button[icon="refresh"] {
          position: absolute;
          left: 20px;
          top: 20px;
        }
      </style>
        <paper-icon-button icon="refresh" on-click="updateWeather"></paper-icon-button>
      <paper-icon-button id="delete" icon="remove-circle-outline" title="Remove this location" on-click="removeThisLocation"></paper-icon-button>

      <div class="top-banner">
        <h1>[[result.name]], [[result.sys.country]]<iron-icon icon="maps:my-location" hidden$=[[!isMyLocation]] class="my-location"></iron-icon></h1>
        <h3 class="weather-main">[[weather.main]]</h3>
        <p>[[weather.description]]</p>
        <iron-image class="weather-icon" src="/src/assets/icons/[[weather.icon]].svg"></iron-image>
        <div class="temprature-main">
          <div>
            <h4>Min</h4><p>[[temprature.minTemp]]&deg;C</p>
          </div>
          <div>
            <h4>Current</h4><p>[[temprature.currentTemp]]&deg;C</p>
          </div>
          <div>
            <h4>Max</h4><p>[[temprature.maxTemp]]&deg;C</p>
          </div>
        </div>
      </div>



    `;
  }
  static get properties() {
    return {
      location: {
        type: Object,
        observer: '_locationChanged'
      },
      apiKey: {
        readOnly: true,
        value: '9ed4dc1cb82440897da0f6ec725aef3e',
        type: String
      },
      result: {
        type: Object,
        observer: '_resultsChanged'
      },
      weather: {
        type: Object,
        computed: '_computeWeather(result)',
        observer: '_weatherChanged'
      },
      highlight: {
        type: String,
        reflectToAttribute: true
      },
      temprature: {
        type: Object,
        computed: '_computeTemprature(result)'
      },
      locationId: {
        type: String,
        computed: '_computeLocationId(location)',
        reflectToAttribute: true
      }

    };
  }
  _computeWeather(res) {
    return res.weather[0];
  }

  _weatherChanged(newVal, oldVal) {
    if(newVal)
      this.set('highlight', newVal.id)
  }

  _locationChanged(newVal, oldVal) {
    this.updateWeather()
    this.set("isMyLocation", newVal.id == "my-location")
  }

  updateWeather() {
    if(this.location.coords) {
      fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + this.location.coords.lat + '&lon=' + this.location.coords.lng  + '&APPID=' + this.apiKey).then((e)=> {
        if(e.status == 200)
          return e.json();
          throw e;
      }).then(resp => {
        this.set('result', resp)
      }).catch(e=> {
        console.error(e);
      })
    }
  }

  removeThisLocation() {
    let locations = JSON.parse(localStorage.getItem("locations")) || [];
    var index = locations.indexOf(this.location)
    var newLocations = locations.filter((item) => {
      if(item.id != this.location.id)
        return item;
    })
    localStorage.setItem('locations', JSON.stringify(newLocations));
    this.dispatchEvent(new CustomEvent('locations-updated'));
  }

  _resultsChanged(newVal) {
    if(!newVal.name) {
      this.set('result.name',this.location.name);
    }
    if(!newVal.sys.country) {
      this.set('result.sys.country', "EARTH");
    }
  }

  _computeTemprature(r) {
    return {
      maxTemp : (r.main.temp_max - 273.15).toPrecision(4),
      minTemp : (r.main.temp_min - 273.15).toPrecision(4),
      currentTemp : (r.main.temp - 273.15).toPrecision(4)
    };
  }

  _computeLocationId(loc) {
    return loc.id
  }
}

window.customElements.define('weather-view', WeatherView);
