/// <reference path="../typings/index.d.ts" />

import { DataSponsor, DataEvent, DataSummary, OtherID } from './data-interfaces'
export { OtherID }
import fs = require('fs')
const moment = require('moment')

// returns null if the time is invalid
// takes moment object and time string ('16:00:00 PM')
function setTime(mom, time: string): number {
  let [hour, minute, second, ap] = time.split(/[:\s]/g)

  if (/PM/.test(ap)) hour += 12

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

function splitEventData (str): DataEvent {
  // str is csv of row in spread sheet
  const [
    // A
    timeSubmitted,
    // B
    title,
    // C
    date,
    // D        // E      // F      // G      // H
    timeStart,  location, timeEnd,  timeMeet, meetLocation,
    // I    // J          // K        // L              // M
    source, contactEmail, sponsorID,  locationAddress,  meetLocationAddress,
    // N
    description ] = str.split(/\t/g)

  const momentDate = moment(date, 'MM/DD/YYYY')
  const startTime = isInt(timeStart) ? setTime(momentDate, timeStart) : null
  const endTime = isInt(timeEnd) ? setTime(momentDate, timeEnd) : null
  const meetTime = isInt(timeMeet) ? setTime(momentDate, timeMeet) : null
  const submittedTimestamp = moment(timeSubmitted, 'M/D/YYYY H:MM:SS').valueOf()

  let evt: DataEvent = {
    sponsorID,
    submittedTimestamp,
    title,
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

function displaySponsor(evt: DataEvent, useOtherID: boolean): DataEvent {
  evt.sponsorDisplay = evt.sponsorID
  if (useOtherID) {
    evt.sponsorID = OtherID
  }
  return evt
}

function extractEvents (fileContents: any, dataSummary: DataSummary)  {
  const [,...eventsData] = fileContents.split(/\s*\n\s*/g)

  // get all event rows until a row has no contents
  // i = row with out contents or length of eventsData
  let i: number
  for (i = 0; i < eventsData.length; i++) {
    if (!/\w/.test(eventsData[i])) break
  }

  let eventsDataSliced = eventsData.slice(0, i)

  console.log(`# Events (${eventsDataSliced.length})`, eventsDataSliced)

  let events: DataEvent[] = eventsDataSliced
    .map(splitEventData)
    .map((evt: DataEvent) => displaySponsor(evt, null == dataSummary.sponsors[evt.sponsorID])) // Assign sponsorDisplay, and sponsorID to OtherID if sponsor is not legit

  // modify dataSummary
  dataSummary.events.push(...events.slice(0, i))
}

function createDataSponsor(bn: [string, string]): DataSponsor {
  const matchNickname = /^(.+)\((.+)\)$/.exec(bn[0].trim())
  // Match before parenthesis
  const name = matchNickname ? matchNickname[1].trim() : bn[0]
  // Match in parenthesis
  const nickname = matchNickname ? matchNickname[2].trim() : null

  return {
    id: bn[0],
    name,
    nickname,
    image: bn[1]
  }
}

export function create (readFromDirectory: string, done: (error: any, events: DataSummary) => any) {
	let dataSummary: DataSummary = {
    sponsors: {},
    events: []
  }

  const sponsorsContent = fs.readFileSync(__dirname + '/sponsors-info.json', 'utf8')
  const sponsors: [string, string][] = JSON.parse(sponsorsContent)

  const OtherSponsor: [string, string] = [OtherID, null]

  sponsors
    .concat([OtherSponsor])  // Add Other to possible sponsors
    .map(createDataSponsor)  // create bare sponsor
    .forEach((ds: DataSponsor) => dataSummary.sponsors[ds.id] = ds) // map to sponsor id

  // extractEvents needs to read whether the dataSummary has a sponsor, so this is second
  fs.readdirSync(readFromDirectory)
    .map((bn) => fs.readFileSync(`${readFromDirectory}/${bn}`, 'utf8'))    // get file contents
    .forEach((evfile) => extractEvents(evfile, dataSummary)) // map to events

	done(null, dataSummary)
}