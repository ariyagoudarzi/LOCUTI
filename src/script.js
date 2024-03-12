"use strict";

const form = document.querySelector(".form");
const closeModalBtn = document.querySelector("#modalBtn");
const modal = document.querySelector("#modal");
const nameInput = document.querySelector("#name");
const typeInput = document.querySelector("#type");
const coordsContainer = document.querySelector("#coords");
const list = document.querySelector("#list");
const listContainer = document.querySelector("#listContainer");
const BtnDelPlaces = document.querySelector("#delPlaces");

class App {
  #map;
  #mapEvent;
  #places = [];
  #marker = [];
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    closeModalBtn.addEventListener("click", this._closeForm.bind(this));
    form.addEventListener("submit", this._newPlace.bind(this));
    listContainer.addEventListener("click", this._moveToPopup.bind(this));
    BtnDelPlaces.addEventListener("click", this._delPlaces.bind(this));
  }

  _delPlaces(e) {
    e.preventDefault();
    this.#places = [];
    localStorage.clear();
    this.#marker.forEach((marker) => this.#map.removeLayer(marker));
    listContainer.innerHTML = "";
    BtnDelPlaces.classList.add("hidden");
  }

  _moveToPopup(e) {
    const clickedId = +e.target.closest("li").dataset.id;
    if (clickedId) {
      const place = this.#places.find((place) => {
        return place.id === clickedId;
      });
      this.#map.setView(place.coords, 13, {
        animate: true,
        pan: {
          duration: 1,
        },
      });
    }
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
      BtnDelPlaces.classList.remove("hidden");
    } else {
      nameInput.style.border = "1px solid red";
      navigator.vibrate(250);
    }
  }

  _renderPlaceOnMap(place) {
    let marker = L.marker(place.coords)
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
    this.#marker.push(marker);
  }

  _renderPlaceOnList(place) {
    const [lat, lng] = place.coords;

    const req2 = new XMLHttpRequest();
    req2.open("GET", `https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`);
    req2.setRequestHeader(
      "Api-Key",
      "service.02596937d4f9413eab8a91c26a284083"
    );
    req2.send();

    req2.addEventListener("load", function () {
      const data = JSON.parse(this.responseText);
      console.log(data.formatted_address);
      let html = `
    <li class="bg-purple-700 w-11/12 py-4 px-6 rounded-md flex justify-between" data-id="${place.id}">
      <div>
        <p class="text-white py-1">
                نام مکان : <span> ${place.name} </span>
        </p>
        <p class="text-white py-1"> آدرس: <span class="text-sm"> ${data.formatted_address}</span></p>       
    `;
      if (!(place.type === "")) {
        html += `<p class="text-white">
      دسته بندی مکان :<span> ${place.type} </span>
    </p>
  </div>
</li>`;
      } else {
        html += `</li>`;
      }
      listContainer.insertAdjacentHTML("afterbegin", html);
    });
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
        BtnDelPlaces.classList.remove("hidden");
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
