import React from 'react'
import Slider from 'rc-slider/lib/Slider'
// import Input from '../input/input'

export default function SequencerStep (props) {
  const defaults = {
    min: 12,
    max: 127
  }

  const buttonClassName = props.step.enabled
                        ? 'seq-button active'
                        : 'seq-button'
  return (
    <div style={{ width: '100px' }}>
      <Slider min={defaults.min}
        className='seq-range-slider'
        max={defaults.max}
        value={props.step ? props.step.midiNoteNumber : 12}
        label={props.stepNumber + 1}
        step={1}
        defaultValue={48}
        railStyle={{ backgroundColor: 'red', height: 10 }}
        trackStyle={{ backgroundColor: 'blue', height: 10 }}
        handleStyle={{
          borderColor: 'blue',
          height: 28,
          width: 28,
          backgroundColor: 'black'
        }}
        onChange={props.handleStepValueChange} />
      <div className={buttonClassName}
        onClick={() => props.handleStepOnOffChange(props.stepNumber)}>{props.step.enabled ? 'on' : 'off'}</div>
    </div>
  )
}
