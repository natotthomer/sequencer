import React from 'react'

export default function Range (props) {
  return (
    <div className='seq-range-container'>
      <div className='seq-range-label'>
        {props.label}
      </div>
      <div>
        <input className='seq-range-slider' type='range'
          {...props}
          onChange={props.onChange} />
        </div>
      <div className='seq-range-value'>
        {props.value}
      </div>
    </div>
  )
}
