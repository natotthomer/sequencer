import React from 'react'

import SequencerStep from './sequencer_step'

export default function SequencerSteps (props) {
  let steps = []

  const boundStepValueChange = (stepNumber) => {
    return (newValue) => {
      props.handleStepValueChange(stepNumber, newValue)
    }
  }

  for (var i = 0; i < props.numberOfSteps; i++) {
    steps.push(
      <SequencerStep key={i}
        handleStepOnOffChange={props.handleStepOnOffChange}
        handleStepValueChange={boundStepValueChange(i)}
        step={props.steps[i]}
        stepNumber={i} />
    )
  }

  return (
    <div className='seq-steps-container'>
      {steps}
    </div>
  )
}
