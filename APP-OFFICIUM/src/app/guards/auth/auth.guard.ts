import { inject } from '@angular/core';
import { CanActivateFn, createUrlTreeFromSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);

  console.log(route);

  return authService.getToken() ? true : createUrlTreeFromSnapshot(route, ['/home']);
};
