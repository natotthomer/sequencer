import React from 'react'

export default function Dropdown (props) {
  return (
    <div className='seq-dropdown-container'>
      {props.label}
      <select {...props} >
        {
          props.options.map((value, idx) => {
            return (
              <option key={idx} value={value}>
                {value}
              </option>
            )
          })
        }
      </select>
    </div>
  )
}
