
type ID = string

/**
 * Other Id is assigned to any event that does not have an indexed Sponsor
 */
export const OtherID = "Other"

export interface DataSponsor {
  id: ID,
  name: string,
  image: string
  nickname?: string
}

export interface DataEvent {
  sponsorID: ID,
  sponsorDisplay?: string,
  submittedTimestamp: number,
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
