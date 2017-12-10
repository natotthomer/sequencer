import React from 'react'
import Input from './input/input'

export default class Metronome extends React.Component {
  constructor (props) {
    super(props)

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    this.state = {
      tempo: 70.0,
      noteResolution: 1,
      isPlaying: false,
      current16thNote: 0,
      gateLength: 0.05,
      noteLength: 0.25
    }

    this.nextNoteTime = 0.0

    this.lookahead = 0.1
    this.schedulerInterval = 25.0
    this.timerID = null

    this.updateStartStopText = this.updateStartStopText.bind(this)
    this.play = this.play.bind(this)
    this.scheduler = this.scheduler.bind(this)
    this.scheduleNote = this.scheduleNote.bind(this)
    this.nextNote = this.nextNote.bind(this)
    this.handleTempoChange = this.handleTempoChange.bind(this)
    this.handleNoteResolutionChange = this.handleNoteResolutionChange.bind(this)
    // this.handleTempoChange = this.handleTempoChange
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
    this.setState({ isPlaying: !this.state.isPlaying }, () => {
      if (this.state.isPlaying) {
        this.setState({ current16thNote: 0 }, () => {
          this.nextNoteTime = this.audioContext.currentTime
          this.scheduler()
        })
      } else {
        window.clearTimeout(this.timerID)
      }
    })
  }

  scheduler () {
    while (this.nextNoteTime < this.audioContext.currentTime + this.lookahead) {
      this.scheduleNote(this.state.current16thNote, this.nextNoteTime)
      this.nextNote()
    }

    this.timerID = window.setTimeout(this.scheduler, this.schedulerInterval)
  }

  scheduleNote (beatNumber, time) {
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

    osc.start(time)
    osc.stop(time + this.state.gateLength)
  }

  nextNote () {
    var secondsPerBeat = 60.0 / this.state.tempo
    this.nextNoteTime += secondsPerBeat * this.state.noteLength

    this.setState({
      current16thNote: (this.state.current16thNote + 1)
    }, () => {
      if (this.state.current16thNote === 16) {
        this.setState({ current16thNote: 0 })
      }
    })
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
