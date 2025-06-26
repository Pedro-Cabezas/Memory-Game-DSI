const gameGrid = document.getElementById('gameGrid');
const winMessage = document.getElementById('winMessage');
const attemptsSpan = document.getElementById('attempts');
const timerSpan = document.getElementById('timer');
const restartBtn = document.getElementById('restartBtn');

let cardsData = [];
let selected = [];
let lock = false;
let matchedPairs = 0;
let attempts = 0;
let timer;
let secondsElapsed = 0;
const totalPairs = 8;

let leaderboard = [
  { nombre: "Juan", tiempo: 45, intentos: 10 },
  { nombre: "María", tiempo: 52, intentos: 11 },
  { nombre: "Pedro", tiempo: 39, intentos: 9 },
  { nombre: "Ana", tiempo: 60, intentos: 14 },
  { nombre: "Luis", tiempo: 48, intentos: 13 }
];

function formatTime(s) {
  const mins = Math.floor(s / 60).toString().padStart(2, '0');
  const secs = (s % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function startTimer() {
  clearInterval(timer);
  secondsElapsed = 0;
  timerSpan.textContent = formatTime(secondsElapsed);
  timer = setInterval(() => {
    secondsElapsed++;
    timerSpan.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function limpiarJuego() {
  gameGrid.innerHTML = '';
  selected = [];
  lock = false;
  matchedPairs = 0;
  attempts = 0;
  attemptsSpan.textContent = attempts;
  winMessage.style.display = 'none';
  clearInterval(timer);
  timerSpan.textContent = '00:00';
}

function mezclarArray(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function crearCarta(carta) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.pair = carta.pairId;
  card.dataset.id = carta.id;

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  const front = document.createElement('div');
  front.className = 'card-front';
  front.textContent = '?';

  const back = document.createElement('div');
  back.className = 'card-back';

  const img = document.createElement('img');
  img.src = carta.image;
  img.alt = carta.name;

  const nameLabel = document.createElement('div');
  nameLabel.textContent = carta.name;

  back.appendChild(img);
  back.appendChild(nameLabel);

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  card.addEventListener('click', () => voltearCarta(card));

  return card;
}

function iniciarJuego() {
  limpiarJuego();
  startTimer();

  fetch('https://685c1e1289952852c2dc4b9a.mockapi.io/Profesores')
    .then(res => res.json())
    .then(data => {
      cardsData = mezclarArray(data);
      cardsData.forEach(carta => {
        const card = crearCarta(carta);
        gameGrid.appendChild(card);
      });
    });
}

function voltearCarta(card) {
  if (lock || card.classList.contains('revealed')) return;

  const inner = card.querySelector('.card-inner');
  inner.classList.add('click-zoom');
  setTimeout(() => inner.classList.remove('click-zoom'), 300);

  card.classList.add('revealed');
  selected.push(card);

  if (selected.length === 2) {
    lock = true;
    attempts++;
    attemptsSpan.textContent = attempts;

    const [c1, c2] = selected;
    if (c1.dataset.pair === c2.dataset.pair && c1.dataset.id !== c2.dataset.id) {
      matchedPairs++;

      c1.classList.add('match-glow');
      c2.classList.add('match-glow');

      selected = [];
      lock = false;

      if (matchedPairs === totalPairs) {
        clearInterval(timer);
        setTimeout(() => {
          winMessage.style.display = 'block';
          winMessage.classList.add('pop');
          mostrarFormularioYGuardar();
        }, 700);
      }
    } else {
      setTimeout(() => {
        c1.classList.add('shake');
        c2.classList.add('shake');
      }, 100);

      setTimeout(() => {
        c1.classList.remove('revealed', 'shake');
        c2.classList.remove('revealed', 'shake');
        selected = [];
        lock = false;
      }, 1000);
    }
  }
}

function mostrarFormularioYGuardar() {
  const nombre = prompt("¡Ganaste! Ingresá tu nombre para el leaderboard:");
  if (!nombre) return;

  leaderboard.push({ nombre, tiempo: secondsElapsed, intentos: attempts });
  leaderboard.sort((a, b) => a.tiempo - b.tiempo || a.intentos - b.intentos);
  leaderboard = leaderboard.slice(0, 5);
  cargarLeaderboard();
}

function cargarLeaderboard() {
  const tbody = document.querySelector("#leaderboard tbody");
  tbody.innerHTML = "";
  leaderboard.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.intentos}</td>
      <td>${formatTime(item.tiempo)}</td>
    `;
    tbody.appendChild(tr);
  });
}

restartBtn.addEventListener('click', iniciarJuego);

iniciarJuego();
cargarLeaderboard();
