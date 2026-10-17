import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-signed-out',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <main class="signed-out-page">
      <section class="signed-out-card">
        <mat-icon aria-hidden="true">logout</mat-icon>
        <h1>Vous êtes déconnecté</h1>
        <p>Votre session SmartFleet est terminée.</p>
        <button mat-flat-button (click)="login()">Se reconnecter</button>
      </section>
    </main>
  `,
  styles: [`
    .signed-out-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      background: #f3f6fb;
    }
    .signed-out-card {
      width: min(100%, 420px);
      padding: 40px;
      border: 1px solid #dbe4ee;
      border-radius: 18px;
      background: #fff;
      text-align: center;
      box-shadow: 0 12px 28px rgba(15, 23, 42, .07);
    }
    .signed-out-card mat-icon {
      width: 42px;
      height: 42px;
      font-size: 42px;
      color: #165b9f;
    }
    .signed-out-card h1 { margin: 20px 0 8px; font-size: 24px; color: #10233b; }
    .signed-out-card p { margin: 0 0 28px; color: #52667c; }
  `],
})
export class SignedOutComponent {
  private readonly auth = inject(AuthService);

  login(): void {
    void this.auth.login(`${window.location.origin}/dashboard`);
  }
}
