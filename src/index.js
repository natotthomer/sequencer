import ReactDOM from 'react-dom'
import React from 'react'

import App from './app'

import './styles/main.css'

const initializeApp = () => {
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  )
}

document.addEventListener('DOMContentLoaded', initializeApp)
