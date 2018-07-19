import Notify from 'notifyjs'
import { getPath } from './url'

const turnNotice = new Notify('Ownitama', {
  body: `${getPath()} - Its your turn`,
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

export const notifyTurn = () => {
  if (!Notify.needsPermission) {
    turnNotice.show()
  } else if (Notify.isSupported()) {
    Notify.requestPermission(turnNotice.show)
  }
}
