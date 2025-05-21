const GH_API_KEY = "cd44629d-657e-4406-90b0-38b0cfd42d21";
const caminho = window.location.pathname;
const map = L.map("map").setView([0, 0], 2);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

console.log(caminho)
if (caminho.includes("coleta.html")) {
  console.log("Estamos na página de coleta!");
  icon = '../assets/img/pata_pin.png'
}
if (caminho.endsWith("index.html") || caminho === "/") {
  console.log("Estamos na Home!");
  icon = 'assets/img/pata_pin.png'
}

const pataIcon = L.icon({
    iconUrl: icon,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

const locaisDeColeta = [
    {nome: "Realezacanina", lat: -7.9477844262201085, lng: -34.867525030681456},
    {nome: "SENAC (unidade Paulista)", lat: -7.947535184289862, lng: -34.890230439908706},
    {nome: "ETP(Escola Técnica de Pernambuco)", lat: -7.9345600796882945, lng: -34.88312208125041},
    {nome: "Auto Vip Multimarcas", lat: -8.019942484753349, lng: -34.85700036270744},
    {nome: "Cordão Umbilical Rações", lat: -8.018939392276193, lng: -34.85402083372763},
    {nome: "Pet Recife(mercado de Boa Viagem, box 83)", lat: -8.129692822025266, lng: -34.90110605504386},
    {nome: "Escoteiros de Pernambuco", lat: -8.047051776077506, lng: -34.91355608179069},
    {nome: "Escoteiros RegimentoGuararapes", lat: -8.108693180978397, lng: -34.99434258707516},
    {nome: "Gustavo Otica ", lat: -8.062200876701175, lng: -34.88407552971638},
    {nome: "The Journey Burger Beer ", lat: -8.054646192297131, lng: -34.91765458897182},
    {nome: "Marcelo Vila Nova (clinica veterinária) ", lat: -8.022213787803313, lng: -34.92170365599201},
    {nome: "Uninassau Boa Viagem", lat: -8.123594711683806, lng: -34.908186471023434},
    {nome: "Dalis Depilação ", lat: -8.122457000022365, lng: -34.90381519829509},
    {nome: "NEMB ", lat: -8.041990824738441, lng: -34.94530951312807},
    {nome: "Sala de estudos Agamenon Magalhães(apenas alunos) ", lat: -8.048207264103876, lng: -34.89324246716839},
    {nome: "Colégio Mazzarello Recife(apenas alunos)", lat: -8.044892841626282, lng: -34.95900558057238},
    {nome: "Mercadinho Joinville", lat: -8.070345357860921, lng: -34.91109077055219},
    {nome: "Faculdade Alpha", lat: -8.055788717403491, lng: -34.88366047263357},
    {nome: "CB - Centro de Biociências (UFPE)", lat: -8.050410493690494, lng: -34.94835679182953},
    {nome: "Art Cirúrgica LTDA", lat: -8.049830984294271, lng: -34.90623699382772},
    {nome: "Oxil Gases", lat: -8.108280497657953, lng: -34.90927965401852},
    {nome: "Liferay Latam", lat: -8.064835068164099, lng: -34.873829166825935},
    {nome: "Prainha ZN", lat: -8.048727156599876, lng: -34.91059217113107},
    {nome: "Liferay Latam", lat: -8.051078140854855, lng: -34.906827382208796},
    {nome: "Defina Gráfica", lat: -8.05108084754125, lng: -34.90682685193327},
    {nome: "Vida Animal", lat: -8.11275908517856, lng: -35.01418583172967},
    {nome: "Grupo SADA", lat: -7.6678474248382065, lng: -34.9245356148042},
    {nome: "Hospital de Olhos Santa Luzia", lat: -8.030756643909767, lng: -34.91836193390283},
];

let origemUsuario = null;
let rotaAtual = null;

navigator.geolocation.getCurrentPosition(onLocalizacaoSucesso, onLocalizacaoErro, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
});

function onLocalizacaoSucesso(pos) {
    origemUsuario = [pos.coords.latitude, pos.coords.longitude];
    const precisao = pos.coords.accuracy;

    console.log("Localização atual:", origemUsuario);
    console.log("Precisão:", precisao, "metros");

    if (precisao > 100) {
        alert("A precisão da sua localização é baixa. Ative o GPS ou use um dispositivo com GPS para melhor resultado.");
    }

    L.marker(origemUsuario, {icon: pataIcon}).addTo(map)
        .bindPopup("Você está aqui")
        .openPopup();

    map.setView(origemUsuario, 15);

    locaisDeColeta.forEach(ponto => {
        const marker = L.marker([ponto.lat, ponto.lng], {icon: pataIcon}).addTo(map)
            .bindPopup(ponto.nome);

        marker.on("click", () => {
            if (!origemUsuario) {
                alert("Localização do usuário não disponível.");
                return;
            }
            desenharRotaComGraphHopper(origemUsuario, [ponto.lat, ponto.lng]);
        });
    });
}

function onLocalizacaoErro(error) {
    console.error("Erro ao obter localização:", error);
    alert("Não foi possível obter sua localização. Verifique se o GPS está ativo e a permissão foi concedida.");
}

function desenharRotaComGraphHopper(origem, destino) {
    const url = `https://graphhopper.com/api/1/route?point=${origem[0]},${origem[1]}&point=${destino[0]},${destino[1]}&type=json&locale=pt-BR&vehicle=car&weighting=fastest&elevation=false&use_miles=false&layer=Omniscale&key=${GH_API_KEY}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Erro na API do GraphHopper");
            return response.json();
        })
        .then(data => {
            const caminho = data.paths[0];
            const coords = decodePolyline(caminho.points);

            if (rotaAtual) {
                map.removeLayer(rotaAtual);
            }

            rotaAtual = L.polyline(coords, {color: 'green', weight: 5}).addTo(map);
        })
        .catch(err => {
            console.error("Erro ao buscar rota GraphHopper:", err);
            alert("Erro ao gerar a rota com GraphHopper.");
        });
}

function decodePolyline(encoded) {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += dlng;

        points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
}
