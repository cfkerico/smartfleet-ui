import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/auth/auth.service';
import { SignedOutComponent } from './signed-out.component';

describe('SignedOutComponent', () => {
  it('offers an explicit return to the login page', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [SignedOutComponent],
      providers: [{ provide: AuthService, useValue: { login } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(SignedOutComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Vous êtes déconnecté');

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(login).toHaveBeenCalledWith(`${window.location.origin}/dashboard`);
  });
});
