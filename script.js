const SUPABASE_URL = "https://laqwgudyogubqkyihxdw.supabase.co";
const SUPABASE_KEY = "sb_publishable_bITSd7RbMdfwaknDXV-x7A_yEInJl60";

const searchInput = document.querySelector(".search-bar input");
const searchButton = document.querySelector(".search-bar button");
const resultsDiv = document.getElementById("results");
const modal = document.getElementById("store-modal");
const modalOverlay = document.getElementById("map-overlay");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const mapDiv = document.getElementById("map");
const storeList = document.getElementById("store-list");
const useGpsBtn = document.getElementById("use-gps");
const useZipBtn = document.getElementById("use-zip");
const zipInput = document.getElementById("zip-input");

let map = null;
let currentSnack = "";

// ─── Google Maps init (called by script tag callback) ───────────────────────
function initMap() {
  // Map is initialized when needed
}

// ─── Search Supabase ─────────────────────────────────────────────────────────
async function searchSnacks(query) {
  resultsDiv.innerHTML = "<p class='status-msg'>Searching...</p>";

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/Snacks?or=(name.ilike.*${query}*,brand.ilike.*${query}*,category.ilike.*${query}*)&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const snacks = await response.json();
    console.log("Supabase response:", snacks);

    if (!Array.isArray(snacks) || snacks.length === 0) {
      resultsDiv.innerHTML = "<p class='status-msg'>No snacks found. Try another search!</p>";
      return;
    }

    resultsDiv.innerHTML = snacks
      .map(
        (snack) => `
        <div class="result-card">
          <div class="result-info">
            <div class="result-name">${snack.name}</div>
            <div class="result-meta">
              <span class="result-brand">${snack.brand}</span>
              <span class="result-category">${snack.category}</span>
            </div>
          </div>
          <button class="find-btn" onclick="openStoreLocator('${snack.name.replace(/'/g, "\\'")}')">
            📍 Find near me
          </button>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error("Search error:", err);
    resultsDiv.innerHTML = "<p class='status-msg error'>Something went wrong. Please try again.</p>";
  }
}

// ─── Store Locator ────────────────────────────────────────────────────────────
function openStoreLocator(snackName) {
  currentSnack = snackName;
  modalTitle.textContent = `Stores near you carrying "${snackName}"`;
  document.getElementById("location-prompt").classList.remove("hidden");
  mapDiv.classList.add("hidden");
  storeList.innerHTML = "";
  modal.classList.remove("hidden");
  modalOverlay.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  modalOverlay.classList.add("hidden");
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

// GPS button
useGpsBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    storeList.innerHTML = "<p class='status-msg error'>Geolocation not supported by your browser.</p>";
    return;
  }
  useGpsBtn.textContent = "📍 Getting location...";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      useGpsBtn.textContent = "📍 Use my location";
      const { latitude, longitude } = pos.coords;
      findNearbyStores(latitude, longitude);
    },
    () => {
      useGpsBtn.textContent = "📍 Use my location";
      storeList.innerHTML = "<p class='status-msg error'>Could not get your location. Try a zip code instead.</p>";
    }
  );
});

// Zip code button
useZipBtn.addEventListener("click", () => {
  const zip = zipInput.value.trim();
  if (zip) geocodeZip(zip);
});

zipInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const zip = zipInput.value.trim();
    if (zip) geocodeZip(zip);
  }
});

// Convert zip to coordinates
function geocodeZip(zip) {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: zip }, (results, status) => {
    if (status === "OK") {
      const { lat, lng } = results[0].geometry.location;
      findNearbyStores(lat(), lng());
    } else {
      storeList.innerHTML = "<p class='status-msg error'>Could not find that zip code. Please try again.</p>";
    }
  });
}

// Search for nearby stores using Places API
function findNearbyStores(lat, lng) {
  document.getElementById("location-prompt").classList.add("hidden");
  mapDiv.classList.remove("hidden");
  storeList.innerHTML = "<p class='status-msg'>Finding stores near you...</p>";

  const location = new google.maps.LatLng(lat, lng);

  map = new google.maps.Map(mapDiv, {
    center: location,
    zoom: 13,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#1c1815" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#f0e8dc" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#1c1815" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2520" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d0b08" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#242018" }] },
    ],
  });

  // User location marker
  new google.maps.Marker({
    position: location,
    map,
    title: "Your location",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#e8651a",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 2,
    },
  });

  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(
    {
      location,
      radius: 5000,
      type: ["convenience_store", "grocery_or_supermarket"],
    },
    (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        displayStores(results.slice(0, 8), map);
      } else {
        storeList.innerHTML = "<p class='status-msg error'>No stores found nearby. Try a different location.</p>";
      }
    }
  );
}

function displayStores(stores, map) {
  storeList.innerHTML = "";

  stores.forEach((store, i) => {
    new google.maps.Marker({
      position: store.geometry.location,
      map,
      title: store.name,
      label: {
        text: String(i + 1),
        color: "#fff",
        fontSize: "12px",
        fontWeight: "bold",
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: "#e8651a",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
    });

    const card = document.createElement("div");
    card.className = "store-card";
    card.innerHTML = `
      <div class="store-number">${i + 1}</div>
      <div class="store-info">
        <div class="store-name">${store.name}</div>
        <div class="store-address">${store.vicinity}</div>
        ${store.rating ? `<div class="store-rating">⭐ ${store.rating} (${store.user_ratings_total || 0} reviews)</div>` : ""}
        ${store.opening_hours ? `<div class="store-hours ${store.opening_hours.open_now ? "open" : "closed"}">${store.opening_hours.open_now ? "● Open now" : "● Closed"}</div>` : ""}
      </div>
      <a class="directions-btn" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.name + " " + store.vicinity)}" target="_blank">Directions</a>
    `;

    card.addEventListener("click", () => {
      map.panTo(store.geometry.location);
      map.setZoom(15);
    });

    storeList.appendChild(card);
  });
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) searchSnacks(query);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) searchSnacks(query);
  }
});