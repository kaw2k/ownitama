import * as React from 'react'
import { render } from 'react-dom'

import './styles.scss'

import { App } from './views/index'

function renderApp() {
  const App = require('./views/index').App
  render(<App />, document.getElementById('root'))
}

renderApp()

module['hot'].accept(renderApp)
