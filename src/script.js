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
    let html = `
    <li class="bg-purple-700 w-11/12 px-4 py-3 rounded-md" data-id="${
      place.id
    }">
      <p class="text-white py-1 flex items-center gap-x-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
      <path fill="white" d="M12 2C7.589 2 4 5.589 4 9.995C3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12c0-4.411-3.589-8-8-8m0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4" />
    </svg> نام مکان : <span> ${place.name} </span>
      </p>
      <p class="text-white py-1 flex items-center gap-x-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
      <path fill="white" d="M16.219 1.943c.653.512 1.103 1.339 1.287 2.205a.474.474 0 0 1 .065.026l2.045.946a.659.659 0 0 1 .384.597v12.367a.665.665 0 0 1-.85.634l-5.669-1.6l-6.74 1.858a.674.674 0 0 1-.371-.004L.474 17.217a.66.66 0 0 1-.474-.63V3.998c0-.44.428-.756.855-.632l5.702 1.661l2.898-.887a.734.734 0 0 1 .122-.025c.112-.656.425-1.286.95-1.9c.623-.73 1.716-1.158 2.781-1.209c1.105-.053 1.949.183 2.91.936M1.333 4.881v11.215l4.87 1.449V6.298zm8.209.614l-2.006.613v11.279l5.065-1.394v-3.295c0-.364.299-.659.667-.659c.368 0 .666.295.666.66v3.177l4.733 1.335V6.136l-1.12-.52c-.019.11-.043.218-.073.323A6.134 6.134 0 0 1 16.4 8.05l-2.477 3.093a.67.67 0 0 1-1.073-.037l-2.315-3.353c-.382-.534-.65-1.01-.801-1.436a3.744 3.744 0 0 1-.192-.822m3.83-3.171c-.726.035-1.472.327-1.827.742c-.427.5-.637.968-.679 1.442c-.05.571-.016.974.126 1.373c.105.295.314.669.637 1.12l1.811 2.622l1.91-2.385a4.812 4.812 0 0 0 .841-1.657c.24-.84-.122-2.074-.8-2.604c-.695-.545-1.22-.692-2.018-.653m.138.697c1.104 0 2 .885 2 1.977a1.988 1.988 0 0 1-2 1.977c-1.104 0-2-.885-2-1.977s.896-1.977 2-1.977m0 1.318a.663.663 0 0 0-.667.659c0 .364.299.659.667.659a.663.663 0 0 0 .666-.66a.663.663 0 0 0-.666-.658" />
    </svg>  موقعیت مکانی : <span> ${lat.toFixed(2)}, ${lng.toFixed(2)} </span>
      </p>
    `;
    console.log(!(place.type === ""));
    if (!(place.type === "")) {
      html += `<p class="text-white py-1 flex items-center gap-x-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
	      <g fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
	      	<circle cx="17" cy="7" r="3" />
	      	<circle cx="7" cy="17" r="3" />
	      	<path d="M14 14h6v5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM4 4h6v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
	      </g>
      </svg> دسته بندی مکان :<span> ${place.type.slice(1).slice(0, -1)} </span>
    </p></li>`;
    } else {
      html += "</li>";
    }
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
