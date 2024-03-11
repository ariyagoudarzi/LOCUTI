"use strict";

const form = document.querySelector(".form");
const closeModalBtn = document.querySelector("#modalBtn");
const menuBtn = document.querySelector("#menuBtn");
const closeMenuBtn = document.querySelector("#closeMenuBtn");
const modal = document.querySelector("#modal");
const nameInput = document.querySelector("#name");
const typeInput = document.querySelector("#type");
const coordsContainer = document.querySelector("#coords");
const list = document.querySelector("#list");
const listContainer = document.querySelector("#listContainer");

menuBtn.addEventListener("click", function () {
  list.classList.remove("hidden");
  closeMenuBtn.classList.remove("hidden");
  menuBtn.classList.add("hidden");
});
closeMenuBtn.addEventListener("click", function () {
  list.classList.add("hidden");
  menuBtn.classList.remove("hidden");
  closeMenuBtn.classList.add("hidden");
});

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
      this._renderPlaceOnList(place);
      this._closeForm();
      this._setLocalStorage();
    } else {
      nameInput.style.border = "1px solid red";
      navigator.vibrate(250);
    }
  }

  _renderPlaceOnMap(place) {
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

  _renderPlaceOnList(place) {
    const [lat, lng] = place.coords;
    const html = `
    <li class="bg-blue-600 w-11/12 p-2 rounded-md border-r-white border-r-8">
      <p class="text-white py-1">نام مکان :<span> ${place.name} </span></p>
      <p class="text-white py-1">دسته بندی مکان :<span> ${
        place.type
      } </span></p>
      <p class="text-white py-1"> موقعیت مکانی :<span> ${lat.toFixed(
        2
      )}، ${lng.toFixed(2)} </span></p>
    </li>
    `;
    listContainer.insertAdjacentHTML("afterbegin", html);
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

    if (this.#places) {
      this.#places.forEach((place) => {
        this._renderPlaceOnMap(place);
      });
    }
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
    if (data) this.#places = data;
    this.#places.forEach((place) => {
      this._renderPlaceOnList(place);
    });
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
