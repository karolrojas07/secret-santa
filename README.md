# Amigo Secreto 🎅

Pequeña aplicación web para sortear un **amigo secreto** entre varios participantes, guardando el estado en un archivo `data.json` para que los resultados se conserven entre recargas, sesiones y usuarios.

## Requisitos

- [Node.js](https://nodejs.org/) (versión 16+ recomendada)
- `npm` (se instala junto con Node.js)

## Instalación

En la carpeta del proyecto (`secret_santa`):

```bash
npm install
```

## Ejecución

Inicia el servidor Express:

```bash
npm start
```

Luego abre en tu navegador:

```text
http://localhost:3000/index.html
```

## Cómo funciona

- El archivo `data.json` contiene:
  - `participants`: cada participante y el número de intentos (veces que ya ha visto su amigo secreto).
  - `secretFriends`: la bolsa de nombres que aún pueden ser asignados.
- El backend (`server.js`):
  - Sirve los archivos estáticos (`index.html`, `app.js`, etc.).
  - Expone:
    - `GET /api/state`: devuelve el estado actual de `participants` y `secretFriends`.
    - `POST /api/discover`: recibe `{ participant }`, asigna un amigo secreto válido, actualiza `data.json` y devuelve el resultado.
- El frontend (`app.js`):
  - Carga el estado inicial con `GET /api/state`.
  - Rellena el `<select>` con los participantes, deshabilitando a quienes ya usaron su intento.
  - Al hacer clic en **“Descubrir mi amigo secreto”**, llama a `POST /api/discover`, muestra el resultado y actualiza el listado.

## Notas

- Cada participante solo puede descubrir su amigo secreto **una sola vez**.
- Si un participante se saca a sí mismo y no quedan más participantes disponibles, se muestra un mensaje indicando que hay que repetir el juego.


