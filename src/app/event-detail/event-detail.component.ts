import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'

import { DataEvent, DataSponsor } from '../../../data/data-interfaces'

@Component({
  selector: 'vodka-event-detail',
  template: require('./event-detail.component.html'),
  styles: [
    require('./event-detail.component.styl')
  ]
})
export class EventDetailComponent implements OnInit {
  @Input() event: DataEvent
  @Input() sponsor: DataSponsor
  @Input() isOpen: boolean = true
  @Output() toggleOpen: EventEmitter<boolean>
  displayTime: string
  moment: any
  constructor (private security: DomSanitizer) {
    this.moment = require('moment')
    this.toggleOpen = new EventEmitter<boolean>()
  }
  onClickHeading () {
    this.toggleOpen.emit(!this.isOpen)
  }
  ngOnInit () {
    const time = this.event.startTime || this.event.meetTime
    this.displayTime = this.moment(time).format('h:mm a').replace(/:00/, '')
  }
}
