export function values<T extends object, K extends keyof T>(
  obj: T
): Array<T[K]> {
  let ret: T[K][] = []

  for (let key in obj as any) {
    ret.push(obj[key])
  }
  return ret
}
