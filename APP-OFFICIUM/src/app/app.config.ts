import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { authInterceptor } from './interceptor/auth/auth.interceptor';
import { formDataInterceptor } from './interceptor/formData/form-data.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([SweetAlert2Module.forRoot()]),
    provideHttpClient(withInterceptors([authInterceptor,formDataInterceptor])), // Registra el interceptor funcional
  ]
};
