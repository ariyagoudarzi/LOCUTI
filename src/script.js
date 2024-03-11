"use strict";

const form = document.querySelector(".form");
const closeModalBtn = document.querySelector("#modalBtn");
const modal = document.querySelector("#modal");
const nameInput = document.querySelector("#name");
const typeInput = document.querySelector("#type");
const coordsContainer = document.querySelector("#coords");

class App {
  #map;
  #mapEvent;
  #places = [];
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    closeModalBtn.addEventListener("click", this._closeForm.bind(this));
    form.addEventListener("submit", this._newPlace.bind(this));
  }

  _newPlace(e) {
    e.preventDefault();
    const name = nameInput.value;
    if (name) {
      nameInput.style.border = "none";
      const type = typeInput.value ? `(${typeInput.value})` : "";
      const { lat, lng } = this.#mapEvent.latlng;
      const id = Date.now();
      const place = new Place(name, type, [lat, lng], id);
      this.#places.push(place);
      this._renderPlaceOnMap(place);
      this._closeForm();
      this._setLocalStorage();
    } else {
      nameInput.style.border = "1px solid red";
      navigator.vibrate(250);
    }
  }

  _renderPlaceOnMap(place) {
    console.log(place);
    L.marker(place.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`${place.name} ${place.type}`)
      .openPopup();
  }

  _getPosition() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        console.log("error");
      }
    );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    this.#map = L.map("map").setView([latitude, longitude], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      this.#map
    );

    this.#map.on("click", this._showForm.bind(this));

    this.#places.forEach((place) => {
      this._renderPlaceOnMap(place);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    const { lat } = this.#mapEvent.latlng;
    const { lng } = this.#mapEvent.latlng;
    const html = `
    <span>موقعیت مکانی: </span><span style="font-family: monospace;">${lat.toFixed(
      2
    )}, ${lng.toFixed(2)}</span>
    `;
    coordsContainer.insertAdjacentHTML("afterbegin", html);
    modal.classList.remove("hidden");
    nameInput.focus();
  }

  _closeForm() {
    modal.classList.add("hidden");
    coordsContainer.innerHTML = "";
    nameInput.value = typeInput.value = "";
  }

  _setLocalStorage() {
    localStorage.setItem("places", JSON.stringify(this.#places));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("places"));
    this.#places = data;
  }
}
const app = new App();

class Place {
  constructor(name, type, coords, id) {
    this.name = name;
    this.type = type;
    this.coords = coords;
    this.id = id;
  }
}
