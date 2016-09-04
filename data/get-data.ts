/// <reference path="../typings/index.d.ts" />

import { DataSponsor, DataEvent, DataSummary } from './data-interfaces'
import fs = require('fs')
const moment = require('moment')

// returns null if the time is invalid
// takes moment object and time string ('16:00')
function setTime(mom, time: string): number {
  const [hour, minute] = time.split(':')

  if (isInt(hour) && isInt(minute)) return mom.set('hour', hour).set('minute', minute).valueOf()

  if (time.length)
    console.warn(`Unable to parse time: ${time}`)

  return null
}

function isInt (n: string): boolean {
  const i = parseInt(n)
  if (i === 0) return true
  return !!i;
}

function splitEventData (str, sponsor: DataSponsor): DataEvent {
  // str is csv of row in spread sheet
  const [date, timeStart, timeEnd, location, locationAddress, description, timeMeet, meetLocation, meetLocationAddress, source] = str.split(',')

  const momentDate = moment(date).set('year', 2016)
  const startTime = isInt(timeStart) ? setTime(momentDate, timeStart) : null
  const endTime = isInt(timeEnd) ? setTime(momentDate, timeEnd) : null
  const meetTime = isInt(timeMeet) ? setTime(momentDate, timeMeet) : null

  let evt: DataEvent = {
    sponsor: sponsor.name,
    description,
    startTime,
    endTime,
    location,
    locationAddress,
    meetTime,
    meetLocation,
    meetLocationAddress,
    source
  }
  return evt;
}

function extractEvents (fileContents: any, dataSummary: DataSummary)  {
  const [, sponsorData,, ...eventsData] = fileContents.split(/\s*\n\s*/g)
  console.log("# Sponsor", sponsorData)

  const [sponsorName, sponsorNickname, sponsorLetters, sponsorTwitter] = sponsorData.split(',')

  // TODO use twitter for colors
  let sponsorColorsFiltered: any = null // sponsorColors.filter((s) => s.length > 0)

  const sponsor: DataSponsor = {
    name: sponsorName,
    letters: sponsorLetters,
    nickname: sponsorNickname || null,
    twitter: sponsorTwitter || null,
    colors: sponsorColorsFiltered || null }

  let i: any
  for (i = 0; i < eventsData.length; i++) {
    if (!/\w/.test(eventsData[i])) break
  }

  let eventsDataSliced = eventsData.slice(0, i)

  console.log(`# Events (${eventsDataSliced.length})`, eventsDataSliced)

  let events: DataEvent[] = eventsDataSliced.map((evString: String) => splitEventData(evString, sponsor))


  // modify dataSummary
  dataSummary.events.push(...events.slice(0, i))
  dataSummary.sponsors[sponsor.name] = sponsor
}

export function create (readFromDirectory: string, done: (error: any, events: DataSummary) => any) {
	let dataSummary: DataSummary = {
    sponsors: {},
    events: []
  }

  fs.readdirSync(readFromDirectory)
    .map((bn) => fs.readFileSync(`${readFromDirectory}/${bn}`, 'utf8'))    // get file contents
    .forEach((evfile) => extractEvents(evfile, dataSummary)) // map to events

	done(null, dataSummary)
}
