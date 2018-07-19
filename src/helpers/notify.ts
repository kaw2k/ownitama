import Notify from 'notifyjs'

const turnNotice = new Notify('Ownitama', { body: 'Its your turn' })

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
