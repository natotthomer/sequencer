import React from 'react'
import WAAClock from 'waaclock'

import Input from './input/input'
import Delay from './delay'
import SequencerSteps from './sequencer/sequencer_steps'

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

export default class Sequencer extends React.Component {
  constructor (props) {
    super(props)

    this.setUpAudioContextAndClock()

    const numberOfSteps = 5

    this.state = {
      tempo: 120.0,
      noteResolution: 0,
      isPlaying: false,
      current16thNote: 0,
      gateLength: 0.03,
      noteLength: 0.25,
      numberOfSteps,
      steps: makeSteps(numberOfSteps),
      delayTime: 0.5,
      delayFeedback: 0.3,
      delayMix: 3,
      masterGain: 1
    }

    this.setUpLocalStorage()

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
    this.handleStepValueChange = this.handleStepValueChange.bind(this)
    this.handleStepOnOffChange = this.handleStepOnOffChange.bind(this)
    this.handleDelayTimeChange = this.handleDelayTimeChange.bind(this)
    this.handleDelayFeedbackChange = this.handleDelayFeedbackChange.bind(this)
    this.handleDelayMixChange = this.handleDelayMixChange.bind(this)
    this.handleMasterGainChange = this.handleMasterGainChange.bind(this)
    this.makeOsc = this.makeOsc.bind(this)
    this.setUpAudioContextAndClock = this.setUpAudioContextAndClock.bind(this)
    this.setUpLocalStorage = this.setUpLocalStorage.bind(this)
  }

  setUpLocalStorage () {
    if (this.localStorage) {
      this.localStorage = window.localStorage
    }
  }

  setUpAudioContextAndClock () {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.clock = new WAAClock(this.audioContext)

    this.delayNode = this.audioContext.createDelay(4)
    this.feedbackNode = this.audioContext.createGain()
    this.delayGainNode = this.audioContext.createGain()
    this.bypassNode = this.audioContext.createGain()
    this.masterNode = this.audioContext.createGain()

    this.delayNode.delayTime.setValueAtTime(0.000, this.audioContext.currentTime)
    this.feedbackNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    this.bypassNode.gain.setValueAtTime(1, this.audioContext.currentTime)
    this.delayGainNode.gain.setValueAtTime(0, this.audioContext.currentTime)

    this.delayNode.connect(this.feedbackNode)
    this.feedbackNode.connect(this.delayNode)

    this.delayNode.connect(this.delayGainNode)
    this.delayGainNode.connect(this.masterNode)
    this.bypassNode.connect(this.masterNode)

    this.masterNode.connect(this.audioContext.destination)
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

  handleStepValueChange (stepNumber, value) {
    console.log(stepNumber);
    console.log(value);
    const steps = this.state.steps
    steps[stepNumber].midiNoteNumber = value

    this.setState({ steps })
  }

  handleStepOnOffChange (stepNumber) {
    const steps = this.state.steps
    steps[stepNumber].enabled = !steps[stepNumber].enabled
    this.setState({ steps })
  }

  handleDelayTimeChange (value) {
    this.delayNode.delayTime.setValueAtTime(value, this.audioContext.currentTime)
    this.setState({ delayTime: value })
  }

  handleDelayFeedbackChange (value) {
    this.feedbackNode.gain.setValueAtTime(value, this.audioContext.currentTime)
    this.setState({ delayFeedback: value })
  }

  handleDelayMixChange (value) {
    const bypassGain = Math.cos(value * 0.5 * Math.PI)
    const delayGain = Math.cos((1.0 - (value)) * 0.5 * Math.PI)

    this.bypassNode.gain.setValueAtTime(bypassGain, this.audioContext.currentTime)
    this.delayGainNode.gain.setValueAtTime(delayGain, this.audioContext.currentTime)
    this.setState({ delayMix: value })
  }

  handleMasterGainChange (e) {
    const { value } = e.target
    this.masterNode.gain.setValueAtTime(value, this.audioContext.currentTime)
    this.setState({ masterGain: value })
  }

  play () {
    const isPlaying = !this.state.isPlaying
    this.setState({ isPlaying })
    if (isPlaying) {
      this.clock.start()
      const secondsPerBeat = 60.0 / this.state.tempo
      const repeatTime = secondsPerBeat * this.state.noteLength
      this.event1 = this.clock.callbackAtTime((event) => {
        this.scheduleNote(this.state.current16thNote, event.deadline)
        this.nextNote()
      }, this.audioContext.currentTime).tolerance({ early: 0.1, late: 0.5 }).repeat(repeatTime)
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
    osc.connect(this.delayNode)
    osc.connect(this.bypassNode)
    osc.type = 'sawtooth'
    if (this.state.steps[beatNumber] && this.state.steps[beatNumber].enabled) {
      const noteNumber = this.state.steps[beatNumber].midiNoteNumber
      osc.frequency.setValueAtTime(440 * Math.pow(2, (noteNumber - 69) / 12), this.audioContext.currentTime)
    } else {
      return
    }

    return osc
  }

  scheduleNote (beatNumber, deadline) {
    let osc = this.makeOsc(beatNumber)
    if (osc) {
      osc.start(deadline)
      osc.stop(deadline + this.state.gateLength)
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
    return (
      <div>
        Sequencer
        <div className='seq-global-controls-container'>
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
            value={this.state.masterGain}
            min={0}
            max={1}
            step={0.01}
            onChange={this.handleMasterGainChange}
            label='Master' />
        </div>
        <Delay
          delayTime={this.state.delayTime}
          handleDelayTimeChange={this.handleDelayTimeChange}
          delayFeedback={this.state.delayFeedback}
          handleDelayFeedbackChange={this.handleDelayFeedbackChange}
          delayMix={this.state.delayMix}
          handleDelayMixChange={this.handleDelayMixChange} />
        <SequencerSteps
          numberOfSteps={this.state.numberOfSteps}
          handleStepOnOffChange={this.handleStepOnOffChange}
          handleStepValueChange={this.handleStepValueChange}
          steps={this.state.steps} />
        <button type='button' onClick={this.play}>{this.updateStartStopText()}</button>
      </div>
    )
  }
}
