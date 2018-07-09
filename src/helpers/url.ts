export const getPath = () =>
  window.location.pathname.toLocaleLowerCase().replace(/\W/g, '')
