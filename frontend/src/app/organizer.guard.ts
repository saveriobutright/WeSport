import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const organizerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isLoggedIn()) { auth.login(); return false; }
  if (!auth.hasRole('ORGANIZER')) { alert('Permesso negato: serve ruolo ORGANIZER'); return false; }
  return true;
};
