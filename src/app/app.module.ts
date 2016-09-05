import { NgModule, enableProdMode } from '@angular/core';
import { BrowserModule }            from '@angular/platform-browser';
import { FormsModule }              from '@angular/forms';

import { AppComponent }  from './app.component';
import { LocationTimeComponent } from './location-time/location-time.component'
import { SourceComponent } from './source/source.component'
import { SponsorSearchComponent } from './sponsor-search/sponsor-search.component'
import { EventDetailComponent } from './event-detail/event-detail.component'

// add enableProd to window so it can be called to boost performance
if (location.hostname !== "localhost") enableProdMode()

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, LocationTimeComponent, SourceComponent, SponsorSearchComponent, EventDetailComponent ],
  bootstrap:    [ AppComponent ],

})
export class AppModule { }

