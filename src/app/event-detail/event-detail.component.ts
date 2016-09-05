import { Component, Input, OnInit } from '@angular/core'
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
  displayTime: string
  moment: any
  constructor (private security: DomSanitizer) {
    this.moment = require('moment')
  }
  ngOnInit () {
    const time = this.event.startTime || this.event.meetTime
    this.displayTime = this.moment(time).format('h:mm a').replace(/:00/, '')
  }
}
