import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { EventDetailComponent } from './event-detail.component';
import { CreateEventComponent } from './create-event.component';
import { organizerGuard } from './organizer.guard';
import { EditEventComponent } from './edit-event.component';
import { MyEventsComponent } from './my-events.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'events/:id/edit', component: EditEventComponent, canActivate: [organizerGuard] },
  { path: 'create', component: CreateEventComponent, canActivate: [organizerGuard] },
  { path: 'me', component: MyEventsComponent},
  { path: '**', redirectTo: '' }
];
