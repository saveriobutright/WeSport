import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService, EventResponse } from './api.service';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-event-detail',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="container" *ngIf="event">
    <div class="card pad stack-12">
      <div>
        <h2 class="page-title" style="margin:0">{{event.sport}} <span class="muted">@ {{event.location}}</span></h2>
        <div class="muted">{{event.address}}</div>
      </div>

      <div class="form-row">
        <div class="card pad">
          <div><b>Quando</b><div class="muted">{{event.startAt | date:'full'}}</div></div>
        </div>
        <div class="card pad">
          <div><b>Partecipanti</b><div class="muted">{{event.currentParticipants}} / {{event.maxParticipants}}</div></div>
        </div>
      </div>

      <div class="form-row">
        <div class="card pad">
          <div><b>Totale</b><div class="muted">{{event.totalCost | currency:'EUR'}}</div></div>
        </div>
        <div class="card pad">
          <div><b>Stato</b>
            <div><span class="badge" [ngClass]="event.status==='FULL' ? 'badge-full' : 'badge-open'">{{event.status}}</span></div>
          </div>
        </div>
      </div>

      <div class="form-actions" style="margin-top:6px">
        <button class="btn btn-outline" (click)="login()" *ngIf="!auth.isLoggedIn()">
          Login per partecipare
        </button>
        <button class="btn btn-primary" (click)="join()" *ngIf="auth.isLoggedIn() && !isParticipating">
          Partecipa
        </button>
        <button class="btn btn-outline" (click)="cancel()" *ngIf="auth.isLoggedIn() && isParticipating">
          Annulla partecipazione
        </button>
        <button class="btn" (click)="pay()" *ngIf="auth.isLoggedIn() && isParticipating">
          Paga quota
        </button>
        <a class="btn btn-outline" [routerLink]="['/events', event.id, 'edit']" *ngIf="canEdit()">
          Modifica
        </a>
        <button class="btn btn-danger" (click)="remove()" [disabled]="(event.currentParticipants || 0) > 0" *ngIf="canEdit()">
          Elimina
        </button>
      </div>

      <div *ngIf="message" class="alert alert-ok">{{message}}</div>
      <div *ngIf="error" class="alert alert-err">{{error}}</div>
    </div>
  </div>
  `,
  styles:[`.actions{margin-top:12px;display:flex;gap:8px}.msg{margin-top:8px;color:green}`]
})

export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private router = inject(Router);
  auth = inject(AuthService);
  private errs = inject(ErrorService);

  event?: EventResponse;
  id!: number;
  message = '';
  error = '';
  isParticipating = false;

  ngOnInit(){
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }
  
  load(){ 
    this.api.getEvent(this.id).subscribe(e => this.event = e);
    if (this.auth.isLoggedIn()) {
      this.api.myParticipating().subscribe(list => {
        this.isParticipating = list.some(ev => ev.id === this.id);
      });
    } else {
      this.isParticipating = false;
    } 
  }

  login(){ this.auth.login(); }

  join(){
    this.error = ''; this.message = '';
    this.api.joinEvent(this.id, 'Giocatore').subscribe({
      next: () => { 
      this.message = 'Iscrizione effettuata!'; 
      this.load(); 
      },
      error: err => { 
      this.error = this.errs.msg(err, 'Impossibile unirsi all’evento'); 
      }
    });
  }

  cancel(){
    this.error = ''; 
    this.message = '';
    this.api.cancelParticipation(this.id).subscribe({
      next: () => {
        this.message = 'Partecipazione annullata';
        this.load();
      },
      error: err => {
        this.error = this.errs.msg(err, 'Impossibile annullare la partecipazione');
      }
    });
  }

  pay(){
    this.error = ''; this.message = '';
    this.api.pay(this.id).subscribe({
      next: p => { 
      this.message = `Pagamento ${p.status} - € ${p.amount}`; 
      },
      error: err => { 
      this.error = this.errs.msg(err, 'Impossibile completare il pagamento'); 
      }
    });
  }


  canEdit(): boolean {
    const a: any = this.auth as any;
    if (a.hasRole) return a.hasRole('ORGANIZER');
    return this.auth.isLoggedIn();
  }

  edit(){ this.router.navigate(['/events', this.id, 'edit']); }

  remove(){
    if (!confirm('Confermi eliminazione? Operazione irreversibile.')) return;
    this.error = ''; this.message = '';
    this.api.deleteEvent(this.id).subscribe({
      next: () => { 
      this.message = 'Evento eliminato'; 
      this.router.navigate(['/me']); 
      },
      error: err => { 
      this.error = this.errs.msg(err, 'Impossibile eliminare l’evento'); 
      }
    });
  }

  del(){ this.remove(); }


}
