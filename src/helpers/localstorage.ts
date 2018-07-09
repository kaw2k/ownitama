import { LocalStorageState } from '../interfaces'

const localStorageId = 'ownitama'

export const getPlayer = (): LocalStorageState | null =>
  JSON.parse(localStorage.getItem(localStorageId) || 'null')

export const setPlayer = (state: LocalStorageState | null) =>
  localStorage.setItem(localStorageId, JSON.stringify(state))
