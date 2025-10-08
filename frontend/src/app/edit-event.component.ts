import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ApiService } from './api.service';
import { ErrorService } from './error.service';

@Component({
  standalone: true,
  selector: 'app-edit-event',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <h2>Modifica evento #{{id}}</h2>

    <form [formGroup]="form" (ngSubmit)="save()" class="form">
      <!-- SPORT -->
      <label class="form-row">
        <span>Sport</span>
        <select formControlName="sportId">
          <option *ngFor="let s of sports" [value]="s.id">{{ s.name }}</option>
          <option value="" disabled>──────────</option>
          <option value="_add">➕ Aggiungi nuovo sport…</option>
        </select>
      </label>

      <!-- Inline add SPORT -->
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

      <!-- LOCATION -->
      <label class="form-row">
        <span>Location</span>
        <select formControlName="locationId">
          <option *ngFor="let l of locations" [value]="l.id">{{ l.name }}</option>
          <option value="" disabled>──────────</option>
          <option value="_add">➕ Aggiungi nuova location…</option>
        </select>
      </label>

      <!-- Inline add LOCATION -->
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

      <!-- DATA/ORA -->
      <label class="form-row">
        <span>Data e ora</span>
        <input type="datetime-local" formControlName="startAt">
      </label>

      <!-- MAX -->
      <label class="form-row">
        <span>Max partecipanti</span>
        <input type="number" formControlName="maxParticipants" min="1">
      </label>

      <!-- COSTO -->
      <label class="form-row">
        <span>Costo totale (€)</span>
        <input type="number" formControlName="totalCost" step="0.01" min="0">
      </label>

      <div class="actions">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving || savingSport || savingLoc">Salva</button>
        <button type="button" class="btn btn-outline" (click)="cancel()">Annulla</button>
      </div>
    </form>

    <div class="alert alert-err" *ngIf="error">{{error}}</div>
    <div class="alert alert-ok"  *ngIf="message">{{message}}</div>
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
    .alert { margin-top:10px }
    .alert-err { color:#b00020 }
    .alert-ok { color:#0a7a00 }
  `]
})
export class EditEventComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private errs = inject(ErrorService);

  id!: number;
  form!: FormGroup;

  sports: any[] = [];
  locations: any[] = [];

  // mini-forms state (come in create)
  newSportName = '';
  savingSport = false;

  newLoc: { name: string; address: string; lat?: number | null; lng?: number | null } =
    { name: '', address: '', lat: null, lng: null };
  savingLoc = false;

  error = '';
  message = '';
  saving = false;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.form = this.fb.group({
      sportId: [null, Validators.required],
      locationId: [null, Validators.required],
      startAt: ['', Validators.required],
      maxParticipants: [1, [Validators.required, Validators.min(1)]],
      totalCost: [0, [Validators.required, Validators.min(0)]],
    });

    // Carico cataloghi + dettagli evento prima di patchare (evita race)
    forkJoin({
      sports: this.api.sports(),
      locations: this.api.locations(),
      event: this.api.getEvent(this.id)
    }).subscribe({
      next: ({ sports, locations, event }) => {
        this.sports = sports;
        this.locations = locations;

        // ISO -> datetime-local (senza Z e nel fuso locale)
        const dt = new Date(event.startAt);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const local = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

        this.form.patchValue({
          sportId: this.lookupId(this.sports, event.sport),
          locationId: this.lookupId(this.locations, event.location),
          startAt: local,
          maxParticipants: event.maxParticipants,
          totalCost: event.totalCost
        });
      },
      error: err => this.error = this.errs.msg(err, 'Impossibile caricare i dati')
    });
  }

  // mappa il nome visualizzato -> id (DTO evento ha solo i nomi)
  private lookupId(list: any[], name: string): number | null {
    const found = list.find(x => x.name === name);
    return found ? found.id : null;
    }

  cancel(){ this.router.navigate(['/events', this.id]); }

  // ---- mini-form SPORT ----
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
    else this.form.patchValue({ sportId: null });
  }

  // ---- mini-form LOCATION ----
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
    else this.form.patchValue({ locationId: null });
  }

  save(){
    if (this.form.invalid) return;

    // blocca salvataggio se è selezionato "_add"
    const sportSel = this.form.get('sportId')?.value as any;
    const locSel = this.form.get('locationId')?.value as any;
    if (sportSel === '_add' || locSel === '_add') {
      this.message = 'Conferma il nuovo sport/location con "Salva" prima di salvare le modifiche.';
      return;
    }

    this.error = ''; this.message = ''; this.saving = true;

    const v = this.form.value;
    const iso = new Date(v.startAt as string).toISOString();

    const body = {
      sportId: Number(v.sportId),
      locationId: Number(v.locationId),
      startAt: iso,
      maxParticipants: Number(v.maxParticipants),
      totalCost: Number(v.totalCost)
    };

    this.api.updateEvent(this.id, body).subscribe({
      next: () => {
        this.message = 'Modifiche salvate.';
        this.router.navigate(['/events', this.id]);
      },
      error: err => this.error = this.errs.msg(err, 'Impossibile salvare le modifiche'),
      complete: () => this.saving = false
    });
  }
}
