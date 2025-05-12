const destino = {
  lat: -8.063169,
  lng: -34.871139
};

const ORS_API_KEY = "5b3ce3597851110001cf6248b9889ce31a9b450987a967d54b747874";

// Cria o mapa centralizado no destino
const map = L.map("map").setView([destino.lat, destino.lng], 15);

// Camada base do mapa
L.tileLayer(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 20,
}).addTo(map);

// Define o ícone personalizado
const pataIcon = L.icon({
  iconUrl: 'assets/img/pata_pin.png', // Caminho para o seu ícone
  iconSize: [38, 38],       // Tamanho do ícone
  iconAnchor: [19, 38],     // Âncora do ícone no ponto
  popupAnchor: [0, -38]     // Posição do popup
});

// Adiciona o marcador do destino com o ícone personalizado
L.marker([destino.lat, destino.lng], { icon: pataIcon }).addTo(map)
  .bindPopup("Destino: ONG de reciclagem")
  .openPopup();

// Solicita a localização do usuário
navigator.geolocation.getCurrentPosition(onLocalizacaoSucesso, onLocalizacaoErro, {
  enableHighAccuracy: true,
  timeout: 15000,
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

  // Adiciona marcador da origem (usuário) com o mesmo ícone
  L.marker(origem, { icon: pataIcon }).addTo(map)
    .bindPopup("Você está aqui")
    .openPopup();

  // Ajusta o mapa para mostrar ambos os pontos
  const bounds = L.latLngBounds([origem, [destino.lat, destino.lng]]);
  map.fitBounds(bounds.pad(0.1));

  // Desenha a rota entre os pontos
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
      [origem[1], origem[0]],  // longitude, latitude
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
      L.polyline(coords, { color: 'green', weight: 5 }).addTo(map);
    })
    .catch(err => {
      console.error("Erro ao buscar rota ORS:", err);
      alert("Erro ao gerar a rota com OpenRouteService.");
    });
}
