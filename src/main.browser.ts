import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import { Globals } from './app/globals'

// action url provided
const ActionURLs = {
  "submit-event": Globals.SUBMISSION_URL,
  "submit-feedback": Globals.FEEDBACK_URL
}

// check if this URL is trying to redirect to a url
const searchOpenURLMatch = /action=([\w\-]+)/.exec(location.search)
let markForNavigation: boolean = false
if (searchOpenURLMatch) {
  const URLKey = searchOpenURLMatch[1]
  const URL = ActionURLs[URLKey]
  if (!URL) {
    console.warn(`Url not found for action: ${URLKey}`)
  } else {
    location.href = URL
    markForNavigation = true
  }
}

if (!markForNavigation) {
  platformBrowserDynamic().bootstrapModule(AppModule);
}
