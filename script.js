<<<<<<< HEAD
// Coordenadas do destino (ex: ONG ou ponto de coleta)
const destino = {
  lat: -8.063169,
  lng: -34.871139
};

// Inicializa o mapa centrado no destino
const map = L.map("map").setView([destino.lat, destino.lng], 15);

// Adiciona o tile da Geoapify (substitua com sua API key real)
const GEOAPIFY_API_KEY = "be5d2709c88f464285463a626c6a8f16";

L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`, {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 20,
}).addTo(map);

// Marcador do destino
L.marker([destino.lat, destino.lng]).addTo(map)
  .bindPopup("Destino: ONG de reciclagem")
  .openPopup();

// Obtém a localização atual do usuário
navigator.geolocation.getCurrentPosition(onLocalizacaoSucesso, onLocalizacaoErro, {
  enableHighAccuracy: true
});

function onLocalizacaoSucesso(pos) {
  const origem = [pos.coords.latitude, pos.coords.longitude];

  // Marcador da posição atual
  L.marker(origem).addTo(map)
    .bindPopup("Você está aqui")
    .openPopup();

  // Ajusta visual para incluir os dois pontos
  const bounds = L.latLngBounds(origem, [destino.lat, destino.lng]);
  map.fitBounds(bounds);

  // Chama a função que desenha a rota
  desenharRota(origem, [destino.lat, destino.lng]);
}

function onLocalizacaoErro() {
  alert("Não foi possível obter sua localização.");
}

function desenharRota(origem, destino) {
  const url = `https://api.geoapify.com/v1/routing?waypoints=${origem[0]},${origem[1]}|${destino[0]},${destino[1]}&mode=walk&apiKey=${GEOAPIFY_API_KEY}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const rota = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
      L.polyline(rota, { color: 'blue', weight: 5 }).addTo(map);
    })
    .catch(err => {
      console.error("Erro ao buscar a rota:", err);
    });
}
=======
const destino = {
    lat: -8.063169,
    lng: -34.871139
};

const ORS_API_KEY = "5b3ce3597851110001cf6248b9889ce31a9b450987a967d54b747874";

const map = L.map("map").setView([destino.lat, destino.lng], 15);

const pataIcon = L.icon({
    iconUrl: "assets/img/pata_pin.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 20,
}).addTo(map);

L.marker([destino.lat, destino.lng], {icon: pataIcon}).addTo(map)
    .bindPopup("Destino: ONG de reciclagem")
    .openPopup();

navigator.geolocation.getCurrentPosition(onLocalizacaoSucesso, onLocalizacaoErro, {
    enableHighAccuracy: true,
    timeout: 25000,
    maximumAge: 0
});

function onLocalizacaoSucesso(pos) {
    const origem = [pos.coords.latitude, pos.coords.longitude];
    const precisao = pos.coords.accuracy;

    console.log("Localização atual:", origem);
    console.log("Precisão:", precisao, "metros");

    if (precisao > 100) {
        alert("A precisão da sua localização é baixa. Ative o GPS ou use um dispositivo com GPS para melhor resultado.");
    }

    L.marker(origem, {icon: pataIcon}).addTo(map)
        .bindPopup("Você está aqui")
        .openPopup();

    const bounds = L.latLngBounds([origem, [destino.lat, destino.lng]]);
    map.fitBounds(bounds.pad(0.1));

    desenharRotaComORS(origem, [destino.lat, destino.lng]);
}

function onLocalizacaoErro(error) {
    console.error("Erro ao obter localização:", error);
    alert("Não foi possível obter sua localização. Verifique se o GPS está ativo e a permissão foi concedida.");
}

function desenharRotaComORS(origem, destino) {
    const url = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";

    const body = {
        coordinates: [
            [origem[1], origem[0]],
            [destino[1], destino[0]]
        ]
    };

    fetch(url, {
        method: "POST",
        headers: {
            "Authorization": ORS_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(res => {
            if (!res.ok) throw new Error("Erro na API do OpenRouteService");
            return res.json();
        })
        .then(data => {
            const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
            L.polyline(coords, {color: 'green', weight: 5}).addTo(map);
        })
        .catch(err => {
            console.error("Erro ao buscar rota ORS:", err);
            alert("Erro ao gerar a rota com OpenRouteService.");
        });
}
>>>>>>> 78aa90c (Alterações em coleta.html e script.js na branch maps)
