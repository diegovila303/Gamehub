# GameHub 🎮

App para gamers — comparte tu estado de juego con tus amigos en tiempo real.

## Requisitos

- [Node.js](https://nodejs.org) (versión LTS)
- [Git](https://git-scm.com)

## Instalación local

```bash
# 1. Instala dependencias
npm install

# 2. Arranca en modo desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Publicar en Vercel

### Paso 1 — Sube el proyecto a GitHub

1. Ve a [github.com](https://github.com) → New repository → nombre: `gamehub`
2. En tu carpeta del proyecto ejecuta:

```bash
git init
git add .
git commit -m "primer commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/gamehub.git
git push -u origin main
```

### Paso 2 — Conecta con Vercel

1. Ve a [vercel.com](https://vercel.com) → Add New Project
2. Importa tu repositorio de GitHub
3. Deja la configuración por defecto → Deploy
4. En ~1 minuto tendrás tu URL lista 🎉

## Configuración base44 (opcional)

Si tienes credenciales de base44, edita `src/lib/app-params.js`:

```js
export const appParams = {
  appId: "TU_APP_ID",
  token: "TU_TOKEN",
  ...
}
```

Sin credenciales, la app funciona en modo local (datos guardados en el navegador).

## Estructura

```
src/
  components/
    chat/        → ChatBubble
    friends/     → FriendCard
    layouts/     → AppLayout
    nav/         → BottomNav
    status/      → StatusOption, GamePicker, TimePicker
  lib/
    entities.js  → lógica de datos
    games.js     → lista de juegos
    utils.js     → helpers
  pages/
    EstadoPage, AmigosPage, ChatPage, PerfilPage
```
