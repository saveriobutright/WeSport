import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, EventResponse } from './api.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="container">
    <h2 class="page-title">Eventi</h2>

    <div *ngIf="events.length===0" class="card pad muted">Nessun evento ancora.</div>

    <ul class="card-grid" *ngIf="events.length>0">
      <li *ngFor="let e of events" class="card hover">
        <a class="card-item" [routerLink]="['/events', e.id]">
          <div class="kpi">{{e.sport}} <span class="muted">@ {{e.location}}</span></div>
          <div class="muted" style="margin-top:4px">{{e.startAt | date:'short'}}</div>
          <div style="margin-top:6px">Posti: <b>{{e.currentParticipants}}</b> / {{e.maxParticipants}}</div>
          <div style="margin-top:6px">
            <span class="badge" [ngClass]="e.status==='FULL' ? 'badge-full' : 'badge-open'">{{e.status}}</span>
          </div>
        </a>
      </li>
    </ul>
  </div>
  `,
  styles:[`
    .toolbar { margin: 8px 0 16px; }
    .toolbar a { text-decoration: none; }
    .toolbar a:hover { text-decoration: underline; }
    .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;padding:0}
    li{list-style:none;border:1px solid #eee;border-radius:8px;padding:10px}
    .title{font-weight:600;margin-bottom:4px}
  `]
})
export class HomeComponent implements OnInit {
  events: EventResponse[] = [];
  constructor(private api: ApiService) {}
  ngOnInit(){ this.api.publicEvents().subscribe(e => this.events = e); }
}
