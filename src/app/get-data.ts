import { DataSummary, DataEvent, DataSponsor } from '../../data/data-interfaces'

const data = <DataSummary> require('../../data/dist/events.json')

export type DisplayEvent = DataEvent & {
  displayTitle?: string
  hrefLocation?: string
  hrefMeetLocation?: string
}

declare var twemoji: { parse: (str: string) => string }

function compareEvents (a: DataEvent, b: DataEvent): number {
  let aTime = a.startTime || a.meetTime || 0
  let bTime = b.startTime || b.meetTime || 0
  return aTime - bTime
}

import { emojiByName } from './emoji.list'
const emojiFind = new RegExp(
  Object.keys(emojiByName)
    .filter((a) => a.length > 2)
    .map((a) => a.replace(/\+/g, '\\+'))
    .map((a) => `\\b${a}\\b`)
    .join('|'),
  'gi')
const emojiReplace = (match: string) => emojiByName[match.toLowerCase()]

function addEventEmojis (a: DataEvent): DisplayEvent {
  const unicoded = a.title.replace(emojiFind, emojiReplace)
  const displayTitle = twemoji.parse(unicoded)
  let b = <DisplayEvent>
    Object.assign({ displayTitle }, a)
  return b
}

const latLongRegex = /(\-?\d+.\d+)\W+(\-?\d+.\d+)/
const legitLatLongRegex = /(\d+°\d+'\d+(?:.\d*)?"\W*[NS])\W*(\d+°\d+'\d+(?:.\d*)?"\W*[WE])/
function addressToHref(address: string): string {
  if (typeof address !== 'string' || address.length === 0) return null

  const legitLatLongMatch = legitLatLongRegex.exec(address)
  if (legitLatLongMatch) return `https://www.google.com/maps/place/${legitLatLongMatch[1]}+${legitLatLongMatch[2]}`


  const latLongMatch = latLongRegex.exec(address)
  if (latLongMatch) return `https://www.google.com/maps/place/${latLongMatch[1]},${latLongMatch[2]}`
  // test if there are any breaks in the address, indicating that it may be outside Springfield
  // add Springfield, MO otherwise
  if (!/[;,]/.test(address)) address += ', Springfield, MO'
  return `https://www.google.com/maps/place/${address}`
}

function replaceEventLocationLinks (a: DataEvent): DisplayEvent {
  const hrefLocation = addressToHref(a.locationAddress)
  const hrefMeetLocation = addressToHref(a.meetLocationAddress)
  let b = <DisplayEvent>
    Object.assign({}, a, { hrefLocation, hrefMeetLocation })
  return b
}

export function getData(): DataSummary {
  let events: DataEvent[] = data.events
    .sort(compareEvents)
    .map(replaceEventLocationLinks)
    .map(addEventEmojis)

  return {
    events: events,
    sponsors: data.sponsors
  }
}
