import ReactDOM from 'react-dom'
import React from 'react'

import App from './app'

const initializeApp = () => {
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  )
}

document.addEventListener('DOMContentLoaded', initializeApp)
