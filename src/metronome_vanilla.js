import React from 'react'

class Metronome extends React.Component {
  constructor (props) {
    super(props)

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    this.state = {
      tempo: 70.0,
      noteResolution: 2,
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
  }

  updateStartStopText () {
    return this.state.isPlaying ? 'Stop' : 'Start'
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
        Metronome

        <button type='button' onClick={this.play}>{this.updateStartStopText()}</button>
      </div>
    )
  }
}

export default Metronome

// import WAAClock from 'waaclock'
// // const WAAClock = require('waaclock')
//
// const audioContext = new (window.AudioContext || window.webkitAudioContext)()
//
// const clock = new WAAClock(audioContext)
//
// let tempo = 120.0 // in BPM
// let noteResolution = 2 // 0 = 1/16 note, 1 = 1/8, 2 = 1/4
// let isPlaying = false
// let current16thNote // the note being played
// let nextNoteTime = 0.0
// let gateLength = 0.05
// let noteLength = 0.25
//
// let lookahead = 0.1
// let schedulerInterval = 25.0
// let timerID = null
//
// let startStopContainer = document.getElementById('start-stop')
//
// const updateStartStopText = () => {
//   startStopContainer.innerHTML = isPlaying ? 'Stop' : 'Start'
// }
//
// const scheduleNote = (beatNumber, timeToSchedule) => {
//   if ((noteResolution === 1) && (beatNumber % 2)) {
//     return
//   } else if ((noteResolution === 2) && (beatNumber % 4)) {
//     return
//   }
//
//   const osc = audioContext.createOscillator()
//   osc.connect(audioContext.destination)
//   if (!(beatNumber % 16)) {
//     osc.frequency.value = 220
//   } else if (beatNumber % 4) {
//     osc.frequency.value = 440
//   } else {
//     osc.frequency.value = 880
//   }
//
//   osc.start(timeToSchedule)
//   osc.stop(timeToSchedule + gateLength)
// }
//
// const nextNote = () => {
//   var secondsPerBeat = 60.0 / tempo
//
//   nextNoteTime += noteLength * secondsPerBeat
//
//   current16thNote++
//   if (current16thNote === 16) {
//     current16thNote = 0
//   }
// }
//
// const scheduler = () => {
//   while (nextNoteTime < audioContext.currentTime + lookahead) {
//     scheduleNote(current16thNote, nextNoteTime)
//     nextNote()
//   }
//
//   timerID = window.setTimeout(scheduler, schedulerInterval)
// }
//
// const play = () => {
//   isPlaying = !isPlaying
//   updateStartStopText()
//
//   if (isPlaying) {
//     current16thNote = 0
//     nextNoteTime = audioContext.currentTime
//     scheduler()
//   } else {
//     window.clearTimeout(timerID)
//   }
// }
//
// updateStartStopText()
//
// startStopContainer.addEventListener('click', play)
