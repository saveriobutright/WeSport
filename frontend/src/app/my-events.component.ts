import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, EventResponse } from './api.service';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-my-events',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
    <h2 class="page-title">I miei eventi</h2>

    <ng-container *ngIf="!auth.isLoggedIn(); else logged">
      <div class="card pad stack-8">
        <p>Devi effettuare il login per vedere i tuoi eventi.</p>
        <div><button class="btn btn-primary" (click)="login()">Login</button></div>
      </div>
    </ng-container>

    <ng-template #logged>
      <section class="stack-12">
        <div class="card pad">
          <h3 style="margin:0 0 8px">Organizzati da me</h3>

          <div *ngIf="loadingOrg" class="muted">Caricamento…</div>
          <div *ngIf="errorOrg" class="alert alert-err">{{errorOrg}}</div>

          <table class="table" *ngIf="!loadingOrg && !errorOrg">
            <thead><tr>
              <th>ID</th><th>Sport</th><th>Location</th><th>Quando</th><th>Partecipanti</th><th>Stato</th><th style="width:1%"></th>
            </tr></thead>
            <tbody>
              <tr *ngFor="let e of organized">
                <td>{{e.id}}</td>
                <td>{{e.sport}}</td>
                <td>{{e.location}}</td>
                <td>{{e.startAt | date:'short'}}</td>
                <td>{{e.currentParticipants}} / {{e.maxParticipants}}</td>
                <td><span class="badge" [ngClass]="e.status==='FULL' ? 'badge-full' : 'badge-open'">{{e.status}}</span></td>
                <td style="white-space:nowrap; display:flex; gap:8px">
                  <a class="btn btn-outline" [routerLink]="['/events', e.id]">Apri</a>
                  <a class="btn" [routerLink]="['/events', e.id, 'edit']">Modifica</a>
                  <button class="btn btn-danger" (click)="del(e)" [disabled]="busyId===e.id || e.currentParticipants>0" title="Non eliminabile se ci sono partecipanti">Elimina</button>
                </td>
              </tr>
              <tr *ngIf="organized.length===0"><td colspan="7" class="muted">Nessun evento organizzato.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card pad">
          <h3 style="margin:0 0 8px">A cui partecipo</h3>

          <div *ngIf="loadingPart" class="muted">Caricamento…</div>
          <div *ngIf="errorPart" class="alert alert-err">{{errorPart}}</div>

          <table class="table" *ngIf="!loadingPart && !errorPart">
            <thead><tr>
              <th>ID</th><th>Sport</th><th>Location</th><th>Quando</th><th>Partecipanti</th><th>Stato</th><th></th>
            </tr></thead>
            <tbody>
              <tr *ngFor="let e of participating">
                <td>{{e.id}}</td>
                <td>{{e.sport}}</td>
                <td>{{e.location}}</td>
                <td>{{e.startAt | date:'short'}}</td>
                <td>{{e.currentParticipants}} / {{e.maxParticipants}}</td>
                <td><span class="badge" [ngClass]="e.status==='FULL' ? 'badge-full' : 'badge-open'">{{e.status}}</span></td>
                <td><a class="btn btn-outline" [routerLink]="['/events', e.id]">Apri</a></td>
              </tr>
              <tr *ngIf="participating.length===0"><td colspan="7" class="muted">Non stai partecipando ad alcun evento.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="alert alert-ok" *ngIf="message">{{message}}</div>
      </section>
    </ng-template>
  </div>
  `,
  styles: [`
    .block { margin-top:16px }
    table { width:100%; border-collapse: collapse; }
    th, td { border:1px solid #ddd; padding:6px; text-align:left }
    thead { background:#f7f7f7 }
    .actions { display:flex; gap:8px }
    .msg { margin-top:10px; color:green }
    .err { margin:6px 0; color:#b30000 }
  `]
})
export class MyEventsComponent implements OnInit {
  private api = inject(ApiService);
  private errs = inject(ErrorService);
  auth = inject(AuthService);

  organized: EventResponse[] = [];
  participating: EventResponse[] = [];

  loadingOrg = false;
  loadingPart = false;
  errorOrg = '';
  errorPart = '';
  message = '';
  busyId: number | null = null;

  ngOnInit() {
    if (!this.auth.isLoggedIn()) return;
    this.load();
  }

  login(){ this.auth.login(); }

  load() {
    this.message = '';
    this.errorOrg = ''; 
    this.errorPart = '';
    this.loadingOrg = true; 
    this.loadingPart = true;

    this.api.myOrganized()
    .pipe(finalize(() => this.loadingOrg = false))
    .subscribe({
      next: list => this.organized = list,
      error: err => this.errorOrg = err?.error?.message ?? 'Impossibile caricare gli eventi organizzati'
    });

  this.api.myParticipating()
    .pipe(finalize(() => this.loadingPart = false))
    .subscribe({
      next: list => this.participating = list,
      error: err => this.errorPart = err?.error?.message ?? 'Impossibile caricare gli eventi a cui partecipi'
    });
  }

  del(e: EventResponse) {
    if (!confirm(`Eliminare l'evento #${e.id} (${e.sport} @ ${e.location})?`)) return;
    this.busyId = e.id; this.message = '';
    this.api.deleteEvent(e.id).subscribe({
      next: () => {
        this.organized = this.organized.filter(x => x.id !== e.id);
        this.message = 'Evento eliminato.';
      },
      error: err => {
        this.message = this.errs.msg(err, 'Impossibile eliminare l\'evento');
      },
      complete: () => this.busyId = null
    });
  }
}
