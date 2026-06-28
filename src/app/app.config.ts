import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { initKeycloak } from  './core/auth/auth.init';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { provideCharts, withDefaultRegisterables} from 'ng2-charts';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { MAT_DATE_LOCALE } from '@angular/material/core';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor])
    ),
    provideCharts(withDefaultRegisterables()),
    provideNativeDateAdapter(),
    {
      provide: APP_INITIALIZER,
      useFactory: initKeycloak,
      multi: true
    },
    {
      provide: 'LOCALE_ID',
      useValue: 'fr-FR'
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'fr-FR'
    }
  ]
};
