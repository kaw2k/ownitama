import { PlayerLobby, NotificationSettings } from '../interfaces'

const localStorageId = 'ownitama'

export const getPlayer = (): PlayerLobby | null =>
  (JSON.parse(localStorage.getItem(localStorageId) || 'null') || {}).player

export const setPlayer = (player: PlayerLobby | null) => {
  const stored = JSON.parse(localStorage.getItem(localStorageId) || 'null')
  localStorage.setItem(localStorageId, JSON.stringify({ ...stored, player }))
}

export const getNotificationSettings = (): NotificationSettings =>
  JSON.parse(localStorage.getItem(localStorageId) || 'null')
    .notificationSettings || {}

export const setNotificationSettings = (
  notificationSettings: NotificationSettings
) => {
  const stored = JSON.parse(localStorage.getItem(localStorageId) || 'null')
  localStorage.setItem(
    localStorageId,
    JSON.stringify({ ...stored, notificationSettings })
  )
}
