import React from 'react'

import Range from './range'

export default function Input (props) {
  switch (props.type) {
    case 'range': {
      return <Range {...props} />
    }
    default: {
      return <div />
    }
  }
}
