// Estado en memoria que se sincroniza con data.json a través de la API
let participants = {};
let secretFriends = [];

function renderParticipantsSelect(selectedName = '') {
  const select = document.getElementById('participant');

  // Mantener la selección actual si no se pasa explícitamente
  const previousValue = selectedName || select.value || '';

  // Limpiar y agregar opción por defecto
  select.innerHTML = '<option value="">Selecciona un participante</option>';

  for (const name in participants) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;

    if (participants[name] > 0) {
      option.textContent += ` (Intentos: ${participants[name]})`;
      option.disabled = true;
    }

    if (name === previousValue) {
      option.selected = true;
    }

    select.appendChild(option);
  }
}

async function loadState() {
  const messageEl = document.getElementById('message');
  const btnDiscover = document.getElementById('btnDiscover');

  try {
    const response = await fetch('/api/state');
    if (!response.ok) {
      throw new Error('Error al cargar los datos');
    }

    const data = await response.json();
    participants = data.participants || {};
    secretFriends = data.secretFriends || [];

    renderParticipantsSelect();
  } catch (error) {
    console.error(error);
    messageEl.textContent =
      'No se pudieron cargar los datos. Intenta de nuevo más tarde.';
    messageEl.className = 'error';
    btnDiscover.disabled = true;
  }
}

async function discoverSecretFriend(participantName) {
  try {
    const response = await fetch('/api/discover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participant: participantName }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error((data && data.error) || 'Error al descubrir amigo secreto');
    }

    participants = data.participants || {};
    secretFriends = data.secretFriends || [];

    return data.message;
  } catch (error) {
    console.error(error);
    return 'Ocurrió un error al intentar descubrir tu amigo secreto. Intenta de nuevo.';
  }
}

function main() {
  const btnDiscover = document.getElementById('btnDiscover');
  const messageEl = document.getElementById('message');

  loadState();

  btnDiscover.addEventListener('click', async () => {
    const select = document.getElementById('participant');
    const participantName = select.value;

    messageEl.className = '';

    if (participantName === '') {
      messageEl.textContent = 'Por favor, selecciona un nombre';
      messageEl.className = 'error';
      return;
    }

    btnDiscover.disabled = true;
    btnDiscover.textContent = 'Buscando...';

    const secretFriend = await discoverSecretFriend(participantName);

    messageEl.textContent = secretFriend;

    if (
      secretFriend === 'Ya has descubierto tu amigo secreto' ||
      secretFriend === 'No hay mas participantes' ||
      secretFriend ===
        'Hay que repetir el juego! Te has sacado a ti mismo y no hay mas participantes'
    ) {
      // En estos casos se deja el botón deshabilitado
    } else {
      // Volver a habilitar para el siguiente usuario
      btnDiscover.disabled = false;
      btnDiscover.textContent = 'Descubrir mi amigo secreto';
    }

    // Actualizar el select con los nuevos intentos / estados,
    // manteniendo visible el participante que acaba de jugar
    renderParticipantsSelect(participantName);
  });
}

main();