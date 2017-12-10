import React from 'react'
import WAAClock from 'waaclock'

import Input from './input/input'

export default class Metronome extends React.Component {
  constructor (props) {
    super(props)

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.clock = new WAAClock(this.audioContext)
    this.clock.start()

    this.state = {
      tempo: 120.0,
      noteResolution: 0,
      isPlaying: false,
      current16thNote: 0,
      gateLength: 0.05,
      noteLength: 0.25
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

  play () {
    const isPlaying = !this.state.isPlaying
    this.setState({ isPlaying })
    if (isPlaying) {
      var secondsPerBeat = 60.0 / this.state.tempo
      console.log(secondsPerBeat);
      this.event1 = this.clock.callbackAtTime(function () {
        this.scheduleNote(this.state.current16thNote)
        this.nextNote()
      }.bind(this), 0).repeat(secondsPerBeat * this.state.noteLength)
    } else {
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
    if ((this.state.noteResolution === 1) && (beatNumber % 2)) {
      return
    } else if ((this.state.noteResolution === 2) && (beatNumber % 4)) {
      return
    }

    const osc = this.audioContext.createOscillator()
    osc.connect(this.audioContext.destination)
    if (!(beatNumber % 16)) {
      osc.frequency.value = 220
    } else if (beatNumber % 4) {
      osc.frequency.value = 440
    } else {
      osc.frequency.value = 880
    }
    return osc
  }

  scheduleNote (beatNumber) {
    let osc = this.makeOsc(beatNumber)
    if (osc) {
      osc.start(this.audioContext.currentTime)
      osc.stop(this.audioContext.currentTime + this.state.gateLength)
    }
  }

  nextNote () {
    let current16thNote = this.state.current16thNote + 1

    if (current16thNote === 16) {
      current16thNote = 0
    }

    this.setState({ current16thNote })
  }

  render () {
    return (
      <div>
        Sequencer
        <Input type='range'
          value={this.state.tempo}
          min={2}
          max={200}
          onChange={this.handleTempoChange}
          label='tempo' />
        <Input type='dropdown'
          value={this.state.noteResolution}
          onChange={this.handleNoteResolutionChange}
          options={[0, 1, 2]}
          label='subdivision' />

        <button type='button' onClick={this.play}>{this.updateStartStopText()}</button>
      </div>
    )
  }
}
