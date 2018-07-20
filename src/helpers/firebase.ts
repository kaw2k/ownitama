import firebase from 'firebase'
import { CONFIG } from '../config'
import { FirebaseGameState, PlayerLobby, Presence } from '../interfaces'
import { getPath } from './url'
const IdleJs = require('idle-js')

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

export const updateFirebaseGame = (props: FirebaseGameState) => {
  const path = getPath()
  if (!path) return Promise.reject(null)
  return database.ref('game/' + path).update(props || {})
}

export const subscribeToFirebase = ({
  gameState,
  presenceState,
}: {
  gameState: (state: FirebaseGameState | null) => void
  presenceState: (users: { [userHash: string]: Presence }) => void
}) => {
  const path = getPath()
  if (!path.length) return gameState({ type: 'main-lobby' })

  database.ref('game/' + path).on('value', snapshot => {
    gameState(snapshot && snapshot.val())
  })

  database.ref('users').on('value', snapshot => {
    presenceState((snapshot && snapshot.val()) || {})
  })
}

export const hashUser = ({ name, id }: PlayerLobby): string =>
  encodeURIComponent(`${name} ${id}`)

// https://firebase.googleblog.com/2013/06/how-to-build-presence-system.html
let isPresenceSetUp: boolean = false
export const setPresence = (user: PlayerLobby) => {
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
}
