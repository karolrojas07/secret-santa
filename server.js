const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());

// Servir los archivos estáticos (index.html, app.js, etc.)
app.use(express.static(path.join(__dirname)));

async function readData() {
  const fileContents = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(fileContents);
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getSecretFriend(participant, data) {
  const { participants, secretFriends } = data;

  if (participants[participant] === 1) {
    return { message: 'Ya has descubierto tu amigo secreto', data };
  }

  if (secretFriends.length === 0) {
    return { message: 'No hay mas participantes', data };
  }

  const secretFriend =
    secretFriends[Math.floor(Math.random() * secretFriends.length)];

  if (secretFriend === participant && secretFriends.length === 1) {
    return {
      message:
        'Hay que repetir el juego! Te has sacado a ti mismo y no hay mas participantes',
      data,
    };
  }

  if (secretFriend === participant) {
    // Reintentar hasta que salga alguien diferente
    return getSecretFriend(participant, data);
  }

  participants[participant] = (participants[participant] || 0) + 1;
  secretFriends.splice(secretFriends.indexOf(secretFriend), 1);

  return { message: secretFriend, data };
}

// Obtener el estado actual (participantes y lista de amigos secretos)
app.get('/api/state', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al leer los datos' });
  }
});

// Descubrir el amigo secreto de un participante
app.post('/api/discover', async (req, res) => {
  const { participant } = req.body || {};

  if (!participant) {
    return res.status(400).json({ error: 'El participante es obligatorio' });
  }

  try {
    const data = await readData();

    if (!Object.prototype.hasOwnProperty.call(data.participants, participant)) {
      return res.status(400).json({ error: 'Participante no válido' });
    }

    const result = getSecretFriend(participant, data);
    await writeData(result.data);

    res.json({
      message: result.message,
      participants: result.data.participants,
      secretFriends: result.data.secretFriends,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


