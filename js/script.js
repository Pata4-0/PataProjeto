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
