import Notify from 'notifyjs'
import { getPath } from './url'
import { ChatMessage } from '../interfaces'

const turnNotice = new Notify('Ownitama', {
  body: `${getPath()} - It's your turn`,
})

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

export const notifyTurn = () => {
  if (!Notify.needsPermission) {
    turnNotice.show()
  } else if (Notify.isSupported()) {
    Notify.requestPermission(turnNotice.show)
  }
}
