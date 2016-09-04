
type ID = string

export interface DataSponsor {
  id: ID,
  name: string,
  image: string
  nickname?: string
}

export interface DataEvent {
  sponsorID: ID
  submittedTimestamp: number
  title: string,
  description?: string
  startTime: number
  endTime?: number
  location: string
  locationAddress?: string
  meetTime?: number
  meetLocation?: string
  meetLocationAddress?: string
  source?: string
}

export interface DataSummary {
  sponsors: { [id: string]: DataSponsor },
  events: DataEvent[]
}
