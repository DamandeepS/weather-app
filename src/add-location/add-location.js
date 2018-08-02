import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-list/iron-list.js';
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

        iron-icon[icon="search"] {
          padding: 8px;
        }

        .middle-panel > p {
          font-size: 30px;
          font-weight: 100;
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

        #list {
          height: calc(100vh - 120px);
          padding: 8px;
          border-radius: 3px;
          padding-top: 0;
          margin-top: -11px;
        }

        #list paper-item {
          background: #fff;
          color: #333;
          margin-bottom: 2px;
          padding-top: 10px;
          padding-bottom: 10px;
        }

        #list paper-item:last-child {
          border-radius: 0 0 3px 3px;
        }

        #list paper-item paper-item-body > div:first-child {
          font-weight: 500;
          color: #777;
        }

        #list paper-item paper-item-body > div:nth-child(2) {
          font-size: 12px;
          color: #000;
        }

        #list paper-item span.place-id {
          display: none;
        }

        #dialog {
          min-width: 400px;
        }

        #dialog .title {
          font-size: 23px;
          color: #444;
          padding: 5px 0 10px 0;
        }

      </style>


      <div class="search-box">
        <paper-input always-float-label id="queryInput" label="Search" value={{query}}>
          <iron-icon icon="search" slot="prefix"></iron-icon>
          <paper-icon-button icon="arrow-back" on-click="clearQuery" hidden$=[[!query]] slot="suffix"></paper-icon-button>
        </paper-input>
        <iron-list id="list" items=[[suggestions.json.predictions]]>
          <template>
            <paper-item on-click='_getPlaceInfo'>
              <paper-item-body two-line>
                <div>[[item.structured_formatting.main_text]]</div>
                <div secondary>[[item.structured_formatting.secondary_text]] <span class="place-id">[[item.place_id]]</span></div>
              </paper-item-body>
            </paper-item>
          </template>
        </iron-list>
      </div>

      <div class="top-banner">
        <div class="middle-panel">
        <p>Add location</p>

        </div>
      </div>

      <paper-dialog id="dialog" >
        <h2>Add following vicinity?</h2>
        <div class="place-info">
          <div class="title">[[dialogInfo.vicinity]]<span hidden$=[[dialogInfo.vicinity]]>[[dialogInfo.name]]</span></div>
          <a href="[[dialogInfo.url]]" target="_blank" alt="Maps Link">View on Maps</a>
        </div>
        <div class="button">
          <paper-button dialog-dismiss>Decline</paper-button>
          <paper-button dialog-confirm on-click="_addLocationToLocalStorage" autofocus>Accept</paper-button>
        </div>
      </paper-dialog>

    `;
  }
  static get properties() {
    return {
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
      },
      dialogInfo: {
        type: Object,
        observer: '_dialogInfoChanged'
      }

    };
  }

  _getPlaceInfo(e) {
    var elem = undefined;
    e.path.forEach((item)=> {
      if(item.tagName == "PAPER-ITEM")
        elem = item;
    })
    if(elem) {
      const placeId = elem.querySelector('paper-item-body span.place-id').textContent
      console.log(placeId)

      if(placeId) {
        this.set('query', "");
        this.addPlaceToLocations(placeId)
      }
    }
  }

  _queryChanged(newVal, oldVal) {
    if(newVal)
      this._showSuggestions(newVal);
    else {
        this.set("suggestions", [])
        this.$.list.items = []
    }
  }

  addPlaceToLocations(placeId) {
    if(!placeId)
      return;
    fetch('http://localhost:3000/mapsproxy/geocode?id=' + placeId).then(e => {
      if(e.status == 200)
        return e.json();
      throw e;
    }).then(resp => {
      this.set('dialogInfo', resp.json.result)
      console.log(resp)
    }).catch(e => {
      console.error(e)
    })
  }

  _computeWeather(res) {
    return res.weather[0];
  }

  _weatherChanged(newVal, oldVal) {
    if(newVal)
      this.set('highlight', newVal.id)
  }


  _showSuggestions(val) {
    if(this.timeout)
      clearTimeout(this.timeout)
    this.timeout = setTimeout(()=> {
      if(val)
      fetch('http://localhost:3000/mapsproxy/suggestions?input=' + val, {
        mode: 'cors'
      }).then(e=> {
        if(e.status == 200)
          return e.json();
        throw e;
      }).then(resp => {
        console.log(resp)
        this.set('suggestions', resp)
      }).catch(e => {
        console.warn(error)
      })
    }, 300);
  }

  _dialogInfoChanged(newVal) {
    if(newVal == {})
     this.$.dialog.close();
    else {
     this.$.dialog.open();
   }
  }

  _addLocationToLocalStorage() {
    let locations = JSON.parse(localStorage.getItem("locations")) || [];
    var existingIdLocation = false;
    locations.forEach((location)=> {
      if(location.id == this.dialogInfo.place_id)
        existingIdLocation = !!1;;
    })
    if(!existingIdLocation){
      locations.push({id: this.dialogInfo.place_id,name: this.dialogInfo.name, coords: this.dialogInfo.geometry.location})
    }
    localStorage.setItem('locations', JSON.stringify(locations));

    this.dispatchEvent(new CustomEvent('locations-updated', {
      detail: {
        updatedLocationId: this.dialogInfo.place_id
      }
    }));
  }

  clearQuery() {
    this.set("query", "")
  }
  addCurrentLocation() {
    window.navigator.geolocation.getCurrentPosition(e=> {
        let locations = JSON.parse(localStorage.getItem("locations")) || [];
        var existingIdLocation = false;
        locations.forEach((location)=> {
          if(location.id == "my-location")
            existingIdLocation = !!1;;
        })
        if(!existingIdLocation){
          locations.push({id: "my-location", name: "Current Location", coords: {lat: e.coords.latitude, lng: e.coords.longitude}})
        }
        localStorage.setItem('locations', JSON.stringify(locations));

        this.dispatchEvent(new CustomEvent('locations-updated', {
          detail: {
            updatedLocationId: "my-location"
          }
        }));
    }, err => {
      alert("Location permission not granted");
      console.warn(err);
    })
  }

  focusInput() {
    setTimeout(()=> {
      this.$.queryInput.focus();
    }, 200)
  }
}

window.customElements.define('add-location', AddLocation);
