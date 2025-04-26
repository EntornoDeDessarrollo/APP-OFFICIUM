import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { catchError, switchMap, take } from 'rxjs';

export const formDataInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);

  // Aplica este interceptor solo a las rutas específicas de FormData
  if (req.url.endsWith('/desempleado') || req.url.endsWith('/empresa')) {

    console.log("Funcion profile");
    if (req.body instanceof FormData) {
      return authService.authUserBeforeRegister().pipe(
        take(1),
        switchMap(userData => {
          const userId = userData?.IDUsuario;
          if (userId) {
            const formData = req.body as FormData;
            formData.append('IDUsuario', userId);
            const modifiedReq = req.clone({ body: formData });
            console.log("User id: "+userId);
            return next(modifiedReq);
          } else {
            return next(req); // Pasa la petición original si no se obtiene el ID
          }
        }),
        catchError(error => {
          console.error('Error al obtener la información del usuario para FormData:', error);
          return next(req); // Pasa la petición original en caso de error
        })
      );
    }
  }


  console.log("Interceptor 2: ");

  return next(req);
};
