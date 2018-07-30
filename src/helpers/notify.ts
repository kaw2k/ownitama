import Notify from 'notifyjs'
import { getPath } from './url'
import { ChatMessage } from '../interfaces'

export const askPermission = () => {
  if (
    Notify.needsPermission &&
    Notify.isSupported() &&
    Notify.requestPermission
  ) {
    Notify.requestPermission()
  }
}

export const notifyChat = (message: ChatMessage) => {
  const chatNotice = new Notify(message.playerName, { body: message.message })

  if (!Notify.needsPermission) {
    chatNotice.show()
  } else if (Notify.isSupported()) {
    Notify.requestPermission(chatNotice.show)
  }
}

export const notifyTurn = (path = getPath()) => {
  const turnNotice = new Notify('Ownitama', {
    body: `It's your turn: ${path}`,
  })

  if (!Notify.needsPermission) {
    turnNotice.show()
  } else if (Notify.isSupported()) {
    Notify.requestPermission(turnNotice.show)
  }
}
