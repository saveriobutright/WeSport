import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface EventResponse {
  id: number;
  sport: string;
  location: string;
  address: string;
  startAt: string;
  maxParticipants: number;
  currentParticipants: number;
  totalCost: number;
  status: string;
  organizerName: string;
}

export interface SaveEventBody{
  sportId: number;
  locationId: number;
  startAt: string;
  maxParticipants: number;
  totalCost: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  sports()     { return this.http.get<any[]>(`${this.base}/public/sports`); }
  locations()  { return this.http.get<any[]>(`${this.base}/public/locations`); }

  publicEvents()       { return this.http.get<EventResponse[]>(`${this.base}/public/events`); }
  getEvent(id: number) { return this.http.get<EventResponse>(`${this.base}/public/events/${id}`); }

  //Creazione Evento
  createEvent(body: SaveEventBody) {
    return this.http.post<EventResponse>(`${this.base}/events`, body);
  }

  //Update Evento
  updateEvent(id: number, body: SaveEventBody) {
    return this.http.put<EventResponse>(`${this.base}/events/${id}`, body);
  }

  //Delete Evento
  deleteEvent(id: number) {
    return this.http.delete<void>(`${this.base}/events/${id}`);
  }

  //Dashboard "I miei eventi"
  myOrganized(){return this.http.get<EventResponse[]>(`${this.base}/events/mine/organized`);}
  myParticipating(){return this.http.get<EventResponse[]>(`${this.base}/events/mine/participating`);}

  createSport(name: string) {
    return this.http.post<any>(`${this.base}/catalog/sports`, { name });
  }

  createLocation(payload: { name: string; address: string; lat?: number | null; lng?: number | null }) {
    return this.http.post<any>(`${this.base}/catalog/locations`, payload);
  }

  joinEvent(id: number, roleName: string) {
    return this.http.post<EventResponse>(`${this.base}/events/${id}/join`, { roleName });
  }

  cancelParticipation(id: number){
    return this.http.delete<EventResponse>(`${this.base}/events/${id}/join`);
  }

  quota(id: number) {
    return this.http.get<number>(`${this.base}/events/${id}/quota`);
  }

  pay(id: number) {
    return this.http.post<{status: string; amount: number}>(`${this.base}/events/${id}/pay`, {});
  }
}
