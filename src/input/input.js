import React from 'react'

import Range from './range'
import Dropdown from './dropdown'

export default function Input (props) {
  switch (props.type) {
    case 'range': {
      return <Range {...props} />
    }
    case 'dropdown': {
      return <Dropdown {...props} />
    }
    default: {
      return <div />
    }
  }
}
