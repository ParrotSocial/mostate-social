import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core'

import { DataSummary, DataEvent, DataSponsor } from '../../data/data-interfaces'
import { getData } from './get-data'
import { EventDay, EventFilter, EventSorter, EventsByTime } from './shared/event-interfaces'
import { isEventHappening, hasEventStarted, createEventDays, sortEventsByDay } from './shared/event-helpers'

import { Globals } from './globals'

const Moment = require('moment')

import { EventDetailComponent } from './event-detail/event-detail.component'
import { SponsorSearchComponent } from './sponsor-search/sponsor-search.component'

const data: DataSummary = getData()

export type AppDataEvent = { __detailOpen?: boolean } & DataEvent

@Component({
  selector: 'ps-app',
  template: require('./app.component.html'),
  styles: [
`:host {
  display: block;
}`,
require('!raw!stylus!./app.component.styl')
  ]
})
export class AppComponent implements OnInit {
  SUBMISSION_URL = Globals.SUBMISSION_URL
  FEEDBACK_URL = Globals.FEEDBACK_URL
  aboutOpen: boolean = false

  @ViewChild(SponsorSearchComponent) sponsorSearch: SponsorSearchComponent;

  eventDays: EventDay[] = []
  allEvents: DataEvent[] = []

  searchOpen: boolean = false
  searchFilter: EventFilter
  isSearchApplied: boolean
  changeSearchTimer: number

  sponsors: { [name: string]: DataSponsor }
  constructor(private changes: ChangeDetectorRef) {
    this.sponsors = data.sponsors
  }

  // Filters used to filter out events
  getFilters(): EventFilter[] {
    let timeNow = Date.now()
    let filters: EventFilter[] = [
      (e) => isEventHappening(e, timeNow)
    ]

    if (this.isSearchApplied) filters.push(this.searchFilter)

    return filters
  }

  toggleEventDayEvents (eventDay: EventDay) {
    const hackEventDay = <any>eventDay
    const open = !hackEventDay.__detailsOpen

    hackEventDay.__detailsOpen = open

    const len = eventDay.events.length
    for (let i = 0; i < len; i++) {
      let element = <AppDataEvent> eventDay.events[i]
      element.__detailOpen = open
    }
  }

  changeSearch(selectedSponsorsObject: {[sponsor: string]: boolean}) {
    // none selected
    const selKeys = Object.keys(selectedSponsorsObject)
    const selected = selKeys.filter((sponsorID) => selectedSponsorsObject[sponsorID]).length

    const sponKeys = Object.keys(this.sponsors)
    if (sponKeys.length === selected) {
      this.isSearchApplied = false

    } else {
      // Set up search for filtering events
      this.searchFilter = (e) => selectedSponsorsObject[e.sponsorID]
      this.isSearchApplied = true
    }

    // update event list
    clearTimeout(this.changeSearchTimer)
    this.changeSearchTimer = <any> setTimeout(() => {
      this.update()
      this.changes.detectChanges()
    }, 500)
  }

  toggleSearch() {
    // If none are selected and closing the search, then select all
    if (this.searchOpen && this.sponsorSearch.isNoneSelected()) {
      this.sponsorSearch.selectAll()
    }

    if (!this.isSearchApplied) this.sponsorSearch.selectNone()
    this.searchOpen = !this.searchOpen
  }

  cancelSearch() {
    this.searchFilter = null
    this.isSearchApplied = false
    this.sponsorSearch.selectAll()
    this.searchOpen = false
    this.update()
  }

  ngOnInit () {
    this.allEvents = data.events
    this.update()
    if (this.eventDays.length > 0) {
      this.toggleEventDayEvents(this.eventDays[0])
    }
  }

  createDayTitle(m: any): string {
    return (<string> Moment(m).calendar(null, {
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      lastDay: '[Yesterday]',
      nextWeek: 'dddd, MMM Do',
      sameElse: 'dddd, MMM Do'
    })).replace(/ at.*$/, '')
  }

  update() {
    let events = data.events

    for (let filter of this.getFilters()) {
      events = events.filter(filter)
    }

    let timeNow = Date.now()
    events.forEach((e) => {
      if (hasEventStarted(e, timeNow)) {
        (<any> e).started = true
      }
    })

    const eventsByTime = sortEventsByDay(events)
    const eventDays = createEventDays(eventsByTime)
    this.eventDays = eventDays
  }
}
