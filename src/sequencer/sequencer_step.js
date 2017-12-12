import React from 'react'
// import pick from 'lodash/pick'

import Input from '../input/input'

export default function SequencerStep (props) {
  const defaults = {
    min: 12,
    max: 127
  }

  return (
    <div className='seq-step'>
      <Input type='range'
        value={props.step ? props.step.midiNoteNumber : 12}
        min={defaults.min}
        max={defaults.max}
        label={props.stepNumber + 1}
        onChange={props.handleStepValueChange} />
      <div className='hi'
        onClick={() => props.handleStepOnOff(props.stepNumber)}>{props.step.enabled ? 'on' : 'off'}</div>
    </div>
  )
}
