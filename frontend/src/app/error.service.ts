import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ErrorService {

  msg(error: unknown, fallback = 'Si è verificato un errore'): string {
    if (!(error as any)?.status && (error as any)?.message) {
      return (error as any).message as string;
    }

    // Http
    const http = error as HttpErrorResponse;
    const status = http?.status;

    // Proviamo a capire il "message" dal body
    let rawBody: any = http?.error;
    let bodyStr = '';

    if (rawBody) {
      if (typeof rawBody === 'string') {
        bodyStr = rawBody;
        // se è JSON in stringa, provo a parse
        try { rawBody = JSON.parse(rawBody); } catch {}
      }
      if (typeof rawBody === 'object' && rawBody.message) {
        bodyStr = String(rawBody.message);
      }
    }

    // Mapping base per status
    if (status === 0)   return 'Server non raggiungibile. Verifica che il backend sia avviato.';
    if (status === 401) return 'Non sei autenticato o la sessione è scaduta. Effettua il login.';
    if (status === 403) return bodyStr || 'Non hai i permessi necessari per questa operazione.';
    if (status === 404) return bodyStr || 'Risorsa non trovata.';
    if (status === 409) return this.mapConflict(bodyStr) || bodyStr || 'Operazione in conflitto con lo stato attuale.';
    if (status === 400) {
      // Errori di validazione o bad request
      // Esempio GlobalExceptionHandler: "Validation failed: field message; ..."
      if (bodyStr) return bodyStr;
      return 'Dati non validi. Controlla i campi e riprova.';
    }

    // Altri status → prova col messaggio del body, altrimenti fallback
    return bodyStr || fallback;
  }

  /**
   * Traduce/normalizza alcuni messaggi tipici del tuo backend in italiano.
   */
  private mapConflict(bodyMessage: string): string | null {
    if (!bodyMessage) return null;
    const m = bodyMessage.toLowerCase();

    // Messaggi dal tuo EventService / GlobalExceptionHandler
    if (m.includes('già iscritto')) return 'Sei già iscritto a questo evento.';
    if (m.includes('evento al completo')) return 'L’evento è al completo.';
    if (m.includes('già iniziato')) return 'L’evento è già iniziato.';
    if (m.includes('organizzatore')) return 'Solo l’organizzatore dell’evento può eseguire questa azione.';
    if (m.includes('partecipanti')) return bodyMessage; // es: "Ci sono già partecipanti: elimina non consentito"
    if (m.includes('max partecipanti')) return bodyMessage; // es: "Max partecipanti (x) non può essere inferiore..."

    // Messaggi dal CatalogService (inglese)
    if (m.includes('sport already exists')) return 'Lo sport esiste già.';
    if (m.includes('location already exists')) return 'La location esiste già.';

    return null;
  }
}
