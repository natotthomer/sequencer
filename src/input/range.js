import React from 'react'

export default function Range (props) {
  return (
    <div className='seq-range-container'>
      {props.label}
      {props.value}
      <input type='range'
        {...props}
        onChange={props.onChange} />
    </div>
  )
}
