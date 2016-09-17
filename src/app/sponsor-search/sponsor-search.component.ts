import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ElementRef } from '@angular/core';
const moment = require('moment')

import { isEventHappening } from '../shared/event-helpers'

import { EventDay, EventFilter, EventSorter } from '../shared/event-interfaces'
import { DataSummary, DataEvent, DataSponsor, OtherID } from '../../../data/data-interfaces'

export type SelectedSponsors = {[sponsor: string]: boolean}

export type HackSponsor = DataSponsor & { __selected?: boolean, __events?: number }

type EventBySponsor = {[sponsorId: string]: DataEvent[]}

@Component({
  selector: 'ps-sponsor-search',
  template: require('./sponsor-search.component.html'),
  styles: [
`:host {
  display: block;
}`,
    require('./sponsor-search.component.styl')
  ]
})
export class SponsorSearchComponent implements OnInit, OnChanges {
  @Input() sponsorsByID: {[id: string]: HackSponsor} = {}
  @Input() eventDays: EventDay[]
  @Input() allEvents: DataEvent[]
  @Input() selection: SelectedSponsors

  @Output() change: EventEmitter<SelectedSponsors>
  @Output() cancel: EventEmitter<any>
  @Output() close: EventEmitter<any>

  sponsors: HackSponsor[] = []
  sponsorsWithEvents: HackSponsor[] = []
  eventsBySponsor: EventBySponsor = {}

  private selectedSponsors: SelectedSponsors = {}

  constructor(private elt: ElementRef) {
    this.change = new EventEmitter<SelectedSponsors>()
    this.cancel = new EventEmitter<any>()
    this.close = new EventEmitter<any>()
  }

  isSelected(sponsor: HackSponsor): boolean {
    return this.selectedSponsors[sponsor.id] || false
  }

  isNoneSelected(): boolean {
    for (let sponsorId in this.selectedSponsors) {
      if (this.selectedSponsors[sponsorId]) return false
    }

    return true
  }

  selectAll() {
    this.sponsors.forEach((s) => this.select(s, true))
    this.emitChange()
  }

  selectNone() {
    this.sponsors.forEach((s) => this.select(s, false))
    this.emitChange()
  }


  select(sponsor: HackSponsor, select: boolean) {
    sponsor.__selected = select
    this.selectedSponsors[sponsor.id] = select
  }

  toggle(sponsor: HackSponsor) {
    // naughty for performance
    this.select(sponsor, !sponsor.__selected)
    this.emitChange()
  }

  getSponsorInclusionText(sponsor: HackSponsor): string {
    const eventCount = sponsor.__events
    return '' + eventCount
  }

  ngOnChanges () {
    if (this.selection) {
      this.selectedSponsors = this.selection
    }

    this.sponsors = []
    let eventsBySponsor: EventBySponsor = {}
    eventsBySponsor[OtherID] = []
    for (let id in this.sponsorsByID) {
      const sponsor = this.sponsorsByID[id]
      eventsBySponsor[id] = []
      this.sponsors.push(sponsor)
    }

    for (let eventDay of this.eventDays) {
      eventDay.events.forEach((e) => {
        eventsBySponsor[e.sponsorID].push(e)
      })
    }

    this.eventsBySponsor = eventsBySponsor

    this.updateMaxHeight()
  }

  // used in ngTrackBy
  sponsorsTrackByFn (index: number, item: HackSponsor) {
    return item.id
  }

  ngOnInit () {
    // set event count
    let eventTotals = {}
    const now = Date.now()
    const upcomingEvents = this.allEvents.filter((event) => isEventHappening(event, now))
    for (let event of upcomingEvents) {

      const prevCount = eventTotals[event.sponsorID] || 0
      eventTotals[event.sponsorID] = prevCount + 1
    }
    for (let sponsor of this.sponsors) {
      sponsor.__events = eventTotals[sponsor.id] || 0
    }
    this.sponsorsWithEvents = this.sponsors.filter((s) => s.__events > 0)

    this.selectAll()
  }

  updateMaxHeight () {
    const selfElt = <HTMLElement> this.elt.nativeElement
    // the container for all the sponsors
    const sponCont = <HTMLDivElement> selfElt.querySelector('.sponsor-container')
    if (!sponCont) return

    const height = sponCont.offsetHeight

    selfElt.style.maxHeight = `${height + 200}px`;
  }

  nToTime(n: number): string {
    return moment(new Date(n)).format('h:mma')
  }

  private emitChange() {
    setTimeout(() => this.change.emit(this.selectedSponsors), 1)
  }
}
