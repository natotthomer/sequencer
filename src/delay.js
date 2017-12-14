import React from 'react'
import Slider from 'rc-slider/lib/Slider'

export default function Delay (props) {
  return (
    <div className='seq-delay-container'>
      <div style={{ width: '100px' }}>
        <Slider min={0}
          className='seq-range-slider'
          max={4.0}
          value={props.delayTime}
          step={0.001}
          railStyle={{ backgroundColor: 'red', height: 10 }}
          trackStyle={{ backgroundColor: 'blue', height: 10 }}
          handleStyle={{
            borderColor: 'blue',
            height: 28,
            width: 28,
            backgroundColor: 'black'
          }}
          onChange={props.handleDelayTimeChange} />
      </div>
      <div style={{ width: '100px' }}>
        <Slider min={0}
          className='seq-range-slider'
          max={1.0}
          value={props.delayFeedback}
          step={0.01}
          railStyle={{ backgroundColor: 'red', height: 10 }}
          trackStyle={{ backgroundColor: 'blue', height: 10 }}
          handleStyle={{
            borderColor: 'blue',
            height: 28,
            width: 28,
            backgroundColor: 'black'
          }}
          onChange={props.handleDelayFeedbackChange} />
      </div>
      <div style={{ width: '100px' }}>
        <Slider min={0}
          className='seq-range-slider'
          max={1.0}
          value={props.delayMix}
          step={0.01}
          railStyle={{ backgroundColor: 'red', height: 10 }}
          trackStyle={{ backgroundColor: 'blue', height: 10 }}
          handleStyle={{
            borderColor: 'blue',
            height: 28,
            width: 28,
            backgroundColor: 'black'
          }}
          onChange={props.handleDelayMixChange} />
      </div>
    </div>
  )
}
