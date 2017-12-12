import React from 'react'

import SequencerStep from './sequencer_step'

export default function SequencerSteps (props) {
  let steps = []

  for (var i = 0; i < props.numberOfSteps; i++) {
    steps.push(
      <SequencerStep key={i}
        handleStepOnOff={props.handleStepOnOff}
        handleStepValueChange={props.handleStepValueChange}
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
