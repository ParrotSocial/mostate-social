
type ID = string

export interface DataSponsor {
  name: ID
  letters: string
  twitter: string
  nickname?: string
  colors?: string[]
}

export interface DataEvent {
  sponsor: ID
  description: string
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
  sponsors: { [name: string]: DataSponsor },
  events: DataEvent[]
}
