import React from 'react'
import WAAClock from 'waaclock'

import Input from './input/input'

function makeSteps (number) {
  let value = []

  for (var i = 0; i < number; i++) {
    value.push({
      enabled: true,
      midiNoteNumber: 48
    })
  }

  return value
}

export default class Metronome extends React.Component {
  constructor (props) {
    super(props)

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.clock = new WAAClock(this.audioContext)

    this.delayNode = this.audioContext.createDelay(1)
    this.feedbackNode = this.audioContext.createGain()
    this.bypassNode = this.audioContext.createGain()
    this.masterNode = this.audioContext.createGain()

    this.delayNode.delayTime.value = 0.5
    this.feedbackNode.gain.value = 1
    this.bypassNode.gain.value = 1

    this.delayNode.connect(this.feedbackNode)
    this.feedbackNode.connect(this.delayNode)

    this.delayNode.connect(this.bypassNode)
    this.bypassNode.connect(this.masterNode)

    this.masterNode.connect(this.audioContext.destination)

    const numberOfSteps = 5

    this.state = {
      tempo: 120.0,
      noteResolution: 0,
      isPlaying: false,
      current16thNote: 0,
      gateLength: 0.05,
      noteLength: 0.25,
      numberOfSteps,
      steps: makeSteps(numberOfSteps),
      delayTime: 0.5,
      delayFeedback: 1.0
    }

    this.lookahead = 0.1
    this.schedulerInterval = 25.0
    this.timerID = null

    this.updateStartStopText = this.updateStartStopText.bind(this)
    this.play = this.play.bind(this)
    this.scheduleNote = this.scheduleNote.bind(this)
    this.nextNote = this.nextNote.bind(this)
    this.handleTempoChange = this.handleTempoChange.bind(this)
    this.handleNoteResolutionChange = this.handleNoteResolutionChange.bind(this)
    this.handleNumberOfStepsChange = this.handleNumberOfStepsChange.bind(this)
    this.handleStepChange = this.handleStepChange.bind(this)
    this.handleStepOnOff = this.handleStepOnOff.bind(this)
    this.handleDelayTimeChange = this.handleDelayTimeChange.bind(this)
    this.handleDelayFeedbackChange = this.handleDelayFeedbackChange.bind(this)
    this.makeOsc = this.makeOsc.bind(this)
  }

  updateStartStopText () {
    return this.state.isPlaying ? 'Stop' : 'Start'
  }

  handleTempoChange (e) {
    this.setState({ tempo: e.target.value })
  }

  handleNoteResolutionChange (e) {
    this.setState({ noteResolution: parseInt(e.target.value) })
  }

  handleNumberOfStepsChange (e) {
    const value = parseInt(e.target.value)
    let steps = []

    for (var i = 0; i < value; i++) {
      if (this.state.steps[i]) {
        steps.push(this.state.steps[i])
      } else {
        steps = steps.concat(makeSteps(1))
      }
    }

    this.setState({
      numberOfSteps: value,
      steps
    })
  }

  handleStepChange (e) {
    const steps = this.state.steps
    const step = steps[parseInt(e.target.attributes.label.value) - 1]
    step.midiNoteNumber = parseInt(e.target.value)
    this.setState({ steps })
  }

  handleStepOnOff (stepNumber) {
    const steps = this.state.steps
    steps[stepNumber].enabled = !steps[stepNumber].enabled
    this.setState({ steps })
  }

  handleDelayTimeChange (e) {
    this.delayNode.delayTime.value = e.target.value
    this.setState({ delayTime: e.target.value })
  }

  handleDelayFeedbackChange (e) {
    this.feedbackNode.gain.value = e.target.value
    this.setState({ delayFeedback: e.target.value })
  }

  play () {
    const isPlaying = !this.state.isPlaying
    this.setState({ isPlaying })
    if (isPlaying) {
      this.clock.start()
      var secondsPerBeat = 60.0 / this.state.tempo
      this.event1 = this.clock.callbackAtTime(function () {
        this.scheduleNote(this.state.current16thNote)
        this.nextNote()
      }.bind(this), 0).repeat(secondsPerBeat * this.state.noteLength)
    } else {
      this.event1.clear()
      this.clock.stop()
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.event1 && prevState.tempo !== this.state.tempo) {
      const tempoRatio = prevState.tempo / this.state.tempo
      this.clock.timeStretch(this.audioContext.currentTime, [this.event1], tempoRatio)
    }
  }

  makeOsc (beatNumber) {
    const osc = this.audioContext.createOscillator()
    osc.type = 'sawtooth'
    if (this.state.steps[beatNumber] && this.state.steps[beatNumber].enabled) {
      const noteNumber = this.state.steps[beatNumber].midiNoteNumber
      osc.frequency.value = 440 * Math.pow(2, (noteNumber - 69) / 12)
    } else {
      return
    }

    return osc
  }

  scheduleNote (beatNumber) {
    let osc = this.makeOsc(beatNumber)
    if (osc) {
      osc.connect(this.delayNode)
      osc.start(this.audioContext.currentTime)
      osc.stop(this.audioContext.currentTime + this.state.gateLength)
      // osc.disconnect(this.delay)
    }
  }

  nextNote () {
    let current16thNote = this.state.current16thNote + 1

    if (current16thNote === this.state.numberOfSteps) {
      current16thNote = 0
    }

    this.setState({ current16thNote })
  }

  render () {
    let steps = []

    for (var i = 0; i < this.state.numberOfSteps; i++) {
      const stepNum = i
      steps.push(
        <div key={i} className='yo'>
          <Input type='range'
            value={this.state.steps[i] ? this.state.steps[i].midiNoteNumber : 12}
            min={12}
            max={127}
            label={i + 1}
            onChange={this.handleStepChange} />
          <div className='hi'
            onClick={() => this.handleStepOnOff(stepNum)}>{this.state.steps[i].enabled ? 'on' : 'off'}</div>
        </div>
      )
    }

    return (
      <div>
        Sequencer
        <Input type='range'
          value={this.state.tempo}
          min={2}
          max={200}
          onChange={this.handleTempoChange}
          label='tempo' />
        <Input type='range'
          value={this.state.numberOfSteps}
          min={1}
          max={32}
          onChange={this.handleNumberOfStepsChange}
          label='Steps' />
        <Input type='range'
          value={this.state.delayTime}
          min={0.001}
          max={2.0}
          step={0.001}
          onChange={this.handleDelayTimeChange}
          label='delay time' />
        <Input type='range'
          value={this.state.delayFeedback}
          min={0.01}
          max={1.0}
          step={0.01}
          onChange={this.handleDelayFeedbackChange}
          label='delay feedback' />
        {steps}

        <button type='button' onClick={this.play}>{this.updateStartStopText()}</button>
      </div>
    )
  }
}
