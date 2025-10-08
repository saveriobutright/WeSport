import { Injectable } from '@angular/core';
import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private kc?: KeycloakInstance;

  async init(): Promise<void> {
    this.kc = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId
    });

    await this.kc.init({
      onLoad: 'check-sso',     // pagine pubbliche restano accessibili
      checkLoginIframe: false, // più semplice in dev
      pkceMethod: 'S256'
    });

    // refresh periodico del token
    setInterval(() => {
      if (this.kc?.token) {
        this.kc.updateToken(30).catch(() => this.login());
      }
    }, 20000);
  }

  login(): void { this.kc?.login(); }
  logout(): void { this.kc?.logout({ redirectUri: window.location.origin }); }

  isLoggedIn(): boolean { return Boolean(this.kc?.authenticated); }
  token(): string | undefined { return this.kc?.token; }
  username(): string { return (this.kc?.tokenParsed as any)?.preferred_username ?? ''; }
  hasRole(role: string): boolean { return this.kc?.hasRealmRole(role) ?? false; }
}
