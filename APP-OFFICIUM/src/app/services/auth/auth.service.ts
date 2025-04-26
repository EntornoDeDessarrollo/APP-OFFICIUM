import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { AuthResponse, Profile } from '../../interface/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api'; // Ajusta la URL según tu configuración
  private tokenKey = 'authToken';
  private profileSubject = new BehaviorSubject<Profile>(null);
  public profile$ = this.profileSubject.asObservable();



  constructor(private http: HttpClient) {

   }

  register(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // Función para obtener la información del perfil del usuario usando el token
  // getUserProfile(): Observable<Profile> {
  //   const token = this.getToken();
  //   if (!token) {
  //     return of(null); // No hay token, no se puede obtener el perfil
  //   }

  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`
  //   });

  //   const profileUrl = `${this.apiUrl}/user-profile`; // Ajusta este endpoint
  //   return this.http.get<any>(profileUrl, { headers }).pipe(
  //     tap(response => {
  //       if (response?.StatusCode === 200 && response.Data?.profile) {
  //         this.profileSubject.next(response.Data.profile);
  //       } else {
  //         this.profileSubject.next(null);
  //       }
  //     })
  //   );
  // }

  setProfile(profile: Profile): void {
    this.profileSubject.next(profile);
  }

  getProfile(): Profile {
    return this.profileSubject.value;
  }




  logout(): Observable<any> {
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${this.getToken()}`
    // });

    return this.http.post(`${this.apiUrl}/logout`, {}/*, { headers }*/);
  }

  verifyCode(email: string, code: string): Observable<any> {
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${this.getToken()}`
    // });

    return this.http.post(`${this.apiUrl}/verifyCode`, { email, code }/*, { headers }*/);
  }

  //Realizar un intersertor

  recover(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recover`, { email });
  }

  newUnemployed(formData: FormData): Observable<any>  {
    return this.http.post(`${this.apiUrl}/desempleado`, formData);
  }

  newEmployer(formData: FormData): Observable<any>  {
    return this.http.post(`${this.apiUrl}/empresa`, formData);
  }


  getSectores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sector`);
  }

  authUserBeforeRegister(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`);
  }
  testAuth(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get(`${this.apiUrl}/testAuth`, { headers });
  }

   getToken(): string | null {
    return localStorage.getItem('authToken'); // Recupera el token almacenado
  }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token); // Guarda el token
  }

  removeToken(): void {
    localStorage.removeItem('authToken'); // Elimina el token
    this.profileSubject.next(null); //Eliminar servicio de estado
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }


}
