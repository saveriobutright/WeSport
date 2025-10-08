import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';             
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { ErrorService } from './error.service';

@Component({
  standalone: true,
  selector: 'app-create-event',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <h2 class="page-title">Crea evento</h2>

    <form class="form" [formGroup]="form" (ngSubmit)="submit()">
      
      <label class="form-row">
        <span>Sport</span>
        <select formControlName="sportId">
          <option *ngFor="let s of sports" [value]="s.id">{{ s.name }}</option>
          <option value="" disabled>──────────</option>
          <option value="_add">➕ Aggiungi nuovo sport…</option>
        </select>
      </label>

      
      <div class="inline-form" *ngIf="form.get('sportId')?.value === '_add'">
        <input type="text"
               placeholder="Nome sport"
               [(ngModel)]="newSportName"
               name="newSportName"
               [ngModelOptions]="{ standalone: true }" />

        <div class="actions">
          <button type="button"
                  class="btn btn-primary"
                  (click)="saveNewSport()"
                  [disabled]="!newSportName?.trim() || savingSport">
            Salva
          </button>
          <button type="button" class="btn btn-outline" (click)="cancelAddSport()">Annulla</button>
        </div>
      </div>

      
      <label class="form-row">
        <span>Location</span>
        <select formControlName="locationId">
          <option *ngFor="let l of locations" [value]="l.id">{{ l.name }}</option>
          <option value="" disabled>──────────</option>
          <option value="_add">➕ Aggiungi nuova location…</option>
        </select>
      </label>

      
      <div class="inline-form" *ngIf="form.get('locationId')?.value === '_add'">
        <input type="text"
               placeholder="Nome"
               [(ngModel)]="newLoc.name"
               name="newLocName"
               [ngModelOptions]="{ standalone: true }" />
        <input type="text"
               placeholder="Indirizzo"
               [(ngModel)]="newLoc.address"
               name="newLocAddr"
               [ngModelOptions]="{ standalone: true }" />
        <div class="grid-2">
          <input type="number"
                 placeholder="Lat (opzionale)"
                 [(ngModel)]="newLoc.lat"
                 name="newLocLat"
                 [ngModelOptions]="{ standalone: true }" />
          <input type="number"
                 placeholder="Lng (opzionale)"
                 [(ngModel)]="newLoc.lng"
                 name="newLocLng"
                 [ngModelOptions]="{ standalone: true }" />
        </div>

        <div class="actions">
          <button type="button"
                  class="btn btn-primary"
                  (click)="saveNewLocation()"
                  [disabled]="!newLoc.name?.trim() || !newLoc.address?.trim() || savingLoc">
            Salva
          </button>
          <button type="button" class="btn btn-outline" (click)="cancelAddLocation()">Annulla</button>
        </div>
      </div>

      
      <label class="form-row">
        <span>Data e ora</span>
        <input type="datetime-local" formControlName="startAt">
      </label>

      
      <label class="form-row">
        <span>Max partecipanti</span>
        <input type="number" formControlName="maxParticipants" min="1">
      </label>

      
      <label class="form-row">
        <span>Costo totale (€)</span>
        <input type="number" formControlName="totalCost" step="0.01" min="0">
      </label>

      <div class="actions">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || savingSport || savingLoc">Crea</button>
        <button type="button" class="btn btn-outline" (click)="router.navigate(['/'])">Annulla</button>
      </div>
    </form>

    <div class="msg" *ngIf="message">{{ message }}</div>
  `,
  styles: [`
    .form { display:grid; gap:12px; max-width:560px }
    .form-row { display:grid; gap:6px }
    .inline-form { display:grid; gap:8px; padding:10px; border:1px dashed #ccc; border-radius:8px; background:#fafafa }
    .grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap:8px }
    .actions { display:flex; gap:8px; align-items:center }
    .btn { padding:6px 12px; border-radius:8px; border:1px solid #ccc; background:#f3f3f3; cursor:pointer }
    .btn-primary { background:#5b6bff; color:#fff; border-color:#5b6bff }
    .btn-outline { background:#fff }
    .msg { margin-top:10px; color:green }
  `]
})
export class CreateEventComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private errs = inject(ErrorService);
  router = inject(Router);

  sports: any[] = [];
  locations: any[] = [];
  message = '';

  
  newSportName = '';
  savingSport = false;

  newLoc: { name: string; address: string; lat?: number | null; lng?: number | null } =
    { name: '', address: '', lat: null, lng: null };
  savingLoc = false;

  form: FormGroup = this.fb.group({
    sportId: [null, Validators.required],
    locationId: [null, Validators.required],
    startAt: ['', Validators.required],
    maxParticipants: [10, [Validators.required, Validators.min(1)]],
    totalCost: [50, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.api.sports().subscribe(s => {
      this.sports = s;
      
      if (this.form.get('sportId')?.value == null && s.length) {
        this.form.patchValue({ sportId: s[0].id });
      }
    });
    this.api.locations().subscribe(l => {
      this.locations = l;
      if (this.form.get('locationId')?.value == null && l.length) {
        this.form.patchValue({ locationId: l[0].id });
      }
    });
  }

  
  saveNewSport() {
    const name = (this.newSportName || '').trim();
    if (!name) return;

    if (this.sports.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      this.message = 'Sport già presente.';
      return;
    }

    this.savingSport = true;
    this.api.createSport(name).subscribe({
      next: s => {
        this.sports = [...this.sports, s];
        this.form.patchValue({ sportId: s.id }); // seleziona il nuovo
        this.newSportName = '';
      },
      error: err => this.message = this.errs.msg(err, 'Impossibile creare sport'),
      complete: () => this.savingSport = false
    });
  }

  cancelAddSport() {
    this.newSportName = '';
    if (this.sports.length) this.form.patchValue({ sportId: this.sports[0].id });
  }

  
  saveNewLocation() {
    const payload = {
      name: (this.newLoc.name || '').trim(),
      address: (this.newLoc.address || '').trim(),
      lat: this.newLoc.lat ?? null,
      lng: this.newLoc.lng ?? null,
    };
    if (!payload.name || !payload.address) return;

    if (this.locations.some(l => l.name.toLowerCase() === payload.name.toLowerCase())) {
      this.message = 'Location già presente.';
      return;
    }

    this.savingLoc = true;
    this.api.createLocation(payload).subscribe({
      next: l => {
        this.locations = [...this.locations, l];
        this.form.patchValue({ locationId: l.id }); // seleziona la nuova
        this.newLoc = { name: '', address: '', lat: null, lng: null };
      },
      error: err => this.message = this.errs.msg(err, 'Impossibile creare location'),
      complete: () => this.savingLoc = false
    });
  }

  cancelAddLocation() {
    this.newLoc = { name: '', address: '', lat: null, lng: null };
    if (this.locations.length) this.form.patchValue({ locationId: this.locations[0].id });
  }

  
  submit() {
    if (this.form.invalid) return;

    
    const sportSel = this.form.get('sportId')?.value;
    const locSel = this.form.get('locationId')?.value;
    if (sportSel === '_add' || locSel === '_add') {
      this.message = 'Conferma il nuovo sport/location con "Salva" prima di creare l\'evento.';
      return;
    }

    const v = this.form.value;
    const iso = new Date(v.startAt as string).toISOString();

    this.api.createEvent({
      sportId: Number(v.sportId),
      locationId: Number(v.locationId),
      startAt: iso,
      maxParticipants: Number(v.maxParticipants),
      totalCost: Number(v.totalCost)
    }).subscribe({
      next: evt => { this.message = 'Creato!'; this.router.navigate(['/events', evt.id]); },
      error: err => this.message = this.errs.msg(err, 'Errore creazione')
    });
  }
}
