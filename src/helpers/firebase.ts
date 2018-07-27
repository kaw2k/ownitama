import firebase from 'firebase'
import { CONFIG } from '../config'
import {
  FirebaseGameState,
  PlayerLobby,
  Presence,
  GamePreview,
  FirebasePreviewState,
} from '../interfaces'
import { getPath } from './url'
import { values } from './values'
import { isPlayer } from './player'
import { clone } from './clone'
const IdleJs = require('idle-js')

// ===========================================
// CONSTANTS / HELPERS
// ===========================================
const firebaseRoutes = {
  users: () => 'users/',
  games: (path: string = '') => `game/${path}`,
  gamePreviews: (path: string = '') => `preview/${path}`,
}

export const hashUser = ({ name, id }: PlayerLobby): string =>
  encodeURIComponent(`${name} ${id}`)

// ===========================================
// INITIALIZE FIREBASE
// ===========================================
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: CONFIG.apiKey,
    authDomain: CONFIG.authDomain,
    databaseURL: CONFIG.databaseURL,
    projectId: CONFIG.projectId,
    storageBucket: CONFIG.storageBucket,
    messagingSenderId: CONFIG.messagingSenderId,
  })
}

const database = firebase.database()

// ===========================================
// LOBBY
// ===========================================
export const subscribeToLobby = (
  onLobbyChange: (state: FirebaseGameState | null) => void
) => {
  const path = getPath()
  if (!path.length) return onLobbyChange({ type: 'main-lobby' })

  database.ref(firebaseRoutes.games(path)).on('value', snapshot => {
    onLobbyChange(snapshot && snapshot.val())
  })
}

export const updateLobby = (props: FirebaseGameState) => {
  // Validate the path
  const path = getPath()
  if (!path) return Promise.reject(null)

  // Set the preview for the game
  const gamePreviewPath = firebaseRoutes.gamePreviews(path)
  if (props.type === 'lobby') {
    database.ref(gamePreviewPath).remove()
  } else if (props.type === 'game') {
    const players = props.game[0].players
    const preview: GamePreview = {
      path,
      players: [
        { id: players[0].id, name: players[0].name },
        { id: players[1].id, name: players[1].name },
      ],
    }
    database.ref(gamePreviewPath).set(preview)
  }

  // Set the game
  return database.ref(firebaseRoutes.games(path)).update(props || {})
}

// ===========================================
// PRESENCE
// https://firebase.googleblog.com/2013/06/how-to-build-presence-system.html
// ===========================================
let isPresenceSetUp: boolean = false

export const subscribeToPresence = (
  user: PlayerLobby,
  onPresenceChange: (users: { [userHash: string]: Presence }) => void
) => {
  if (isPresenceSetUp) return

  isPresenceSetUp = true

  const amOnline = database.ref('.info/connected')
  const userRef = database.ref(`users/${hashUser(user)}`)

  const setUserPresence = (status: Presence) => {
    userRef.set(status)
  }

  amOnline.on('value', snapshot => {
    if (snapshot && snapshot.val()) {
      userRef.onDisconnect().remove()
      setUserPresence('active')
    }
  })

  new IdleJs({
    idle: 1000 * 60 * 2,
    onIdle: () => setUserPresence('idle'),
    onActive: () => setUserPresence('active'),
    onHide: () => setUserPresence('away'),
    onShow: () => setUserPresence('active'),
  }).start()

  database.ref(firebaseRoutes.users()).on('value', snapshot => {
    onPresenceChange((snapshot && snapshot.val()) || {})
  })
}

// ===========================================
// GAME PREVIEW
// ===========================================
export const subscribeToGamePreview = (
  user: PlayerLobby,
  onGamePreviewChange: (state: GamePreview[]) => void
) => {
  database.ref(firebaseRoutes.gamePreviews()).on('value', snapshot => {
    const isActivePlayer = isPlayer(user)

    const previewObj: FirebasePreviewState = (snapshot && snapshot.val()) || {}

    const previews = values(previewObj).filter(
      game => isActivePlayer(game.players[0]) || isActivePlayer(game.players[1])
    )

    onGamePreviewChange(previews)
  })
}
