import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
/**
 * @customElement
 * @polymer
 */
class AddLocation extends PolymerElement {
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
          display: flex;
          flex-direction: row;
          align-items: center;
          flex-grow: 1;
        }
        .middle-panel {
          display: flex;
          align-items: center;
          flex-direction: column;
          flex-grow: 1;
        }

        paper-button.link {
          font-size: 20px;
        }

        paper-input {
          --paper-input-container-focus-color: #424;
          background-color: #fff;
          padding: 10px;
          margin: 8px;
          border-radius: 3px;
        }

        paper-input iron-icon, paper-input paper-icon-button {
          fill: #111;
          color: #111;
        }

        .search-box {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
        }


      </style>


      <div class="search-box">
        <paper-input always-float-label label="Search" value={{query}}>
          <iron-icon icon="search" slot="prefix"></iron-icon>
          <paper-icon-button icon="arrow-back" slot="suffix"></paper-icon-button>
        </paper-input>
      </div>

      <div class="top-banner">
        <div class="middle-panel">
        <paper-button class="link">Add location</paper-button>

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
        type: Object
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
      suggestions: {
        type: Object
      },
      query: {
        type: String,
        observer: '_queryChanged'
      }

    };
  }

  _queryChanged(newVal, oldVal) {
    this._showSuggestions(newVal)
  }

  _computeWeather(res) {
    return res.weather[0];
  }

  _weatherChanged(newVal, oldVal) {
    if(newVal)
      this.set('highlight', newVal.id)
  }

  _locationChanged(newVal, oldVal) {
    console.log(newVal)
    this.updateWeather()
  }

  updateWeather() {
    if(this.location.coords) {
      fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + this.location.coords.lat + '&lon=' + this.location.coords.lon  + '&APPID=' + this.apiKey).then((e)=> {
        if(e.status == 200)
          return e.json();
          throw e;
      }).then(resp => {
        console.log(resp)
        this.set('result', resp)
      }).catch(e=> {
        console.error(e);
      })
    }
  }

  _showSuggestions(val) {
    if(this.timeout)
      clearTimeout(this.timeout)
    this.timeout = setTimeout(()=> {
      fetch('http://localhost:3000/mapsproxy/suggestions?input=' + val, {
        mode: 'cors'
      }).then(e=> {
        return e.json();
      }).then(resp => {
        console.log(resp)
        this.set('suggestions', resp)
      })
    }, 300);

  }

}

window.customElements.define('add-location', AddLocation);
