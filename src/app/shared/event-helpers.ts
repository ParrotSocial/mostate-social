import { DataSummary, DataEvent, DataSponsor } from '../../../data/data-interfaces'
import { EventDay, EventFilter, EventSorter } from './event-interfaces'

const Moment = require('moment')

export function isEventHappening(event: DataEvent, timeNow: number): boolean {
  // 1000ms * 60s * 60min
  const hour = 36e5 * 4 // four hours
  // has not ended
  if (event.endTime) { if (event.endTime > timeNow) return true; else return false }
  // if event started or starts less than an hour ago, or has not finished yet
  if ((event.startTime || event.meetTime || 0) > timeNow - hour) return true
  return false
}

export function hasEventStarted(event: DataEvent, timeNow: number): boolean {
  // if event started or starts less than an hour ago, or has not finished yet
  if ((event.startTime || event.meetTime || 0) < timeNow) return true
  return false
}

export function createEventDays(eventsByTime: EventsByTime): EventDay[] {
    let eventDays: EventDay[] = []
    const today = Moment(new Date())
    for (let time in eventsByTime) {
      const events = eventsByTime[time]
      const date = new Date(+time)
      eventDays.push({
        date,
        isToday: Moment(date).isSame(today, 'day'),
        events: events
      })
    }

    return eventDays
}

export function sortEventsByDay(events: DataEvent[]): EventsByTime {
  let eventDaysByTime: EventsByTime = {};

  // divide events by time of day
  events.forEach((event) => {
    let time = event.startTime || event.meetTime || console.warn('Invalid time')
    let timeN = <number> Moment(time).startOf('day').valueOf()
    if (!eventDaysByTime[timeN]) {
      eventDaysByTime[timeN] = []
    }
    eventDaysByTime[timeN].push(event)
  })

  return eventDaysByTime
}

