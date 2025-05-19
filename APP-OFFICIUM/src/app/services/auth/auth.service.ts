import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, map, catchError } from 'rxjs';
import { AuthResponse, DesempleadoProfile, EmpresaProfile, Profile } from '../../interface/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api'; // Ajusta la URL según tu configuración
  private profileSubject = new BehaviorSubject<Profile >(null);
  private tokenKey = 'authToken';
  private profileKey = 'userProfile';
  public profile$ = this.profileSubject.asObservable();

  //CONSTRUCTOR
  constructor(private http: HttpClient) {
    this.loadToken(); // Intenta cargar el token al inicio
    this.loadProfile();

  }

  //REGISTRO DESEMPLEADO Y EMPRESA
  register(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { email, password });
  }

  verifyCode(email: string, code: string): Observable<any> {
  // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${this.getToken()}`
    // });

    return this.http.post(`${this.apiUrl}/verifyCode`, { email, code }/*, { headers }*/);
  }

  //DESEMPLEADO
  newUnemployed(formData: FormData): Observable<any>  {
    return this.http.post(`${this.apiUrl}/desempleado`, formData);
  }

  //EMPRESA
  newEmployer(formData: FormData): Observable<any>  {
    return this.http.post(`${this.apiUrl}/empresa`, formData);
  }

  //RECORDAR CONTRASEÑA
  recover(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recover`, { email });
  }

  //CERRAR SESION
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}/*, { headers }*/)
    .pipe(
      tap((response: any)=>{
        if(response && response.message){
          this.removeData();
        }
      })
    );
  }

  removeData(): void {
    this.profileSubject.next(null); //Eliminar servicio de estado
    localStorage.removeItem(this.tokenKey); // Elimina el token
    localStorage.removeItem(this.profileKey); // Elimina el token
  }

  //INICIO DE SESSION
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token); // Guarda el token
  }

  setProfile(profile: Profile | null): void {
    this.profileSubject.next(profile);
    if (profile) {
      this.saveProfile(profile); // Guardar el perfil cada vez que se actualiza
    } else {
      localStorage.removeItem(this.profileKey); // Limpiar al cerrar sesión
    }
  }

  private saveProfile(profile: Profile): void {
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
  }

  getProfile(): Profile | null {
    return this.profileSubject.value;
  }

  loadProfile() {
    const storedProfile = localStorage.getItem(this.profileKey);

    if (storedProfile) {
      const perfil: Profile = JSON.parse(storedProfile);
      this.profileSubject.next(perfil);
      //this.updateDerivedData(perfil); // método que actualiza nombre, foto, etc.
    }
  }


  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
    .pipe(
      tap((response:AuthResponse) => {
        if (response && response.Data?.token) {
          this.saveToken(response.Data.token);
          this.setProfile(response.Data.profile);
          this.saveProfile(response.Data.profile);
        }
      }),
      catchError(error => {
        console.error('Error en el login:', error);
        return of({ StatusCode: 500, ReasonPhrase: 'Error', Message: 'Error al iniciar sesión.' } as AuthResponse); // Ejemplo de manejo de error
      })
    );
  }

  //MANEJO DE DATOS DE LOS PERFILES EMPRESA Y DESEMPLEADO.

  isEmpresa$ = this.profile$.pipe(
    map(profile => !!profile && (profile as EmpresaProfile).NombreEmpresa !== undefined)
  );

  isDesempleado$ = this.profile$.pipe(
    map(profile => !!profile && (profile as DesempleadoProfile).Nombre !== undefined)
  );

  isEmpresaProfile(profile: Profile | null): profile is EmpresaProfile {
    return !!profile && (profile as EmpresaProfile).NombreEmpresa !== undefined;
  }

  isDesempleadoProfile(profile: Profile | null): profile is DesempleadoProfile {
    return !!profile && (profile as DesempleadoProfile).Nombre !== undefined;
  }



  getFotoPerfil$(): Observable<string | null> {
    return this.profile$.pipe(
      map(profile => {
        if (this.isEmpresaProfile(profile) && profile.Foto) {
          return `http://127.0.0.1:8000/${profile.Foto}`;
        } else if (this.isDesempleadoProfile(profile) && profile.Foto) {
          return `http://127.0.0.1:8000/${profile.Foto}`;
        }
        return null; // O una URL por defecto si prefieres
      }),
      catchError(error => {
        console.error('Error al obtener la foto de perfil:', error);
        return of(null); // O la URL por defecto
      })
    );
  }

  getNombre$(): Observable<string> {
    return this.profile$.pipe(
      map(profile => {
        if (this.isEmpresaProfile(profile)) {
          return profile.NombreEmpresa;
        } else if (this.isDesempleadoProfile(profile)) {
          return profile.Nombre;
        }
        return 'Nombre de Usuario'; // Valor por defecto
      }),
      catchError(error => {
        console.error('Error al obtener el nombre:', error);
        return of('Nombre de Usuario');
      })
    );
  }

  getCIFoDNI$(): Observable<string | null> {
    return this.profile$.pipe(
      map(profile => {
        if (this.isEmpresaProfile(profile)) {
          return profile.CIF;
        } else if (this.isDesempleadoProfile(profile)) {
          return profile.DNI;
        }
        return 'Sin Número de Identificación'; // Valor por defecto
      }),
      catchError(error => {
        console.error('Error al obtener el Número de Identificación:', error);
        return of(null);
      })
    );
  }

  getURL$(): Observable<string | null> {
    return this.profile$.pipe(
      map(profile => {
        if (this.isEmpresaProfile(profile)) {
          return profile.SitioWeb;
        } else if (this.isDesempleadoProfile(profile)) {
          return profile.Porfolios;
        }
        return 'Sin Sitio Web'; // Valor por defecto
      }),
      catchError(error => {
        console.error('Error al obtener el El Sitio Web:', error);
        return of(null);
      })
    );
  }

  getIDUsuario$(): Observable<number | null> {
    return this.profile$.pipe(
      map(profile => {
        if (this.isEmpresaProfile(profile)) {
          return profile.IDUsuario;
        } else if (this.isDesempleadoProfile(profile)) {
          return profile.IDUsuario;
        }
        return 0; // Valor por defecto
      }),
      catchError(error => {
        console.error('Error al obtener el Número de Identificación:', error);
        return of(null);
      })
    );
  }

  getIDProfile$(): Observable<number | null> {
    return this.profile$.pipe(
      map(profile => {
        if (this.isEmpresaProfile(profile)) {
          return profile.IDEmpresa;
        } else if (this.isDesempleadoProfile(profile)) {
          return profile.IDDesempleado;
        }
        return 0; // Valor por defecto
      }),
      catchError(error => {
        console.error('Error al obtener el Número de Identificación:', error);
        return of(null);
      })
    );
  }

  getUbicacion$(): Observable<string> {
    return this.profile$.pipe(
      map(profile => {
        if (this.isEmpresaProfile(profile)) {
          return profile.Ubicacion;
        } else if (this.isDesempleadoProfile(profile)) {
          // Añadir Ubicacion al Desempleado
          return 'Ubicación no disponible';
        }
        return 'Sin Ubicacion';
      }),
      catchError(error => {
        console.error('Error al obtener la ubicación:', error);
        return of('Error al obtener la ubicación');
      })
    );
  }

  getIDSector$(): Observable<number | null> {
    return this.profile$.pipe(
      map(profile => this.isEmpresaProfile(profile) ? profile.IDSector : null),
      catchError(error => {
        console.error('Error al obtener el ID del sector:', error);
        return of(null);
      })
    );
  }

  getApellidos$(): Observable<string | null> {
    return this.profile$.pipe(
      map(profile => this.isDesempleadoProfile(profile) ? profile.Apellido : null),
      catchError(error => {
        console.error('Error al obtener los apellidos:', error);
        return of(null);
      })
    );
  }

  getDisponibilidad$(): Observable<string | null> {
    return this.profile$.pipe(
      map(profile => this.isDesempleadoProfile(profile) ? profile.Disponibilidad : null),
      catchError(error => {
        console.error('Error al obtener la disponibilidad:', error);
        return of(null);
      })
    );
  }


  getSubtitulo$(): Observable<string> {
    return this.profile$.pipe(
      map(profile => {
        if (this.isEmpresaProfile(profile)) {
          return `Sector: ${profile.IDSector}`;
        } else if (this.isDesempleadoProfile(profile)) {
          return 'Desempleado'; // Voy a añadir aqui la profesion
        }
        return '';
      }),
      catchError(error => {
        console.error('Error al obtener el subtítulo:', error);
        return of('');
      })
    );
  }

  //UPDATE
  //DESEMPLEADO
  updateUnemployed(idDesempleado: number,formData: FormData): Observable<AuthResponse>  {
    return this.http.post<AuthResponse>(`${this.apiUrl}/desempleado/${idDesempleado}`, formData)
    .pipe(
      tap((response:AuthResponse) => {
        if (response && response.Data?.profile) {
          this.setProfile(response.Data.profile);
        }
      }),
      catchError(error => {
        console.error('Error al editar:', error);
        return of({ StatusCode: error.error.StatusCode, ReasonPhrase: error.error.ReasonPhrase, Message:  error.error.Message} as AuthResponse); // Ejemplo de manejo de error
      })
    );
  }

  //EMPRESA
  updateEmployer(idEmpresa: number, formData: FormData): Observable<AuthResponse>  {
    return this.http.post<AuthResponse>(`${this.apiUrl}/empresa/${idEmpresa}`, formData)
    .pipe(
      tap((response:AuthResponse) => {
        if (response && response.Data?.profile) {
          this.setProfile(response.Data.profile);
        }
      }),
      catchError(error => {
        console.error('Error al editar:', error);
          return of({ StatusCode: error.error.StatusCode, ReasonPhrase: error.error.ReasonPhrase, Message:  error.error.Message} as AuthResponse); // Ejemplo de manejo de error
      })
    );
  }

  //DELETE
  //DESEMPLEADO
  deleteUnemployed(idDesempleado: number): Observable<AuthResponse>  {
    return this.http.delete<AuthResponse>(`${this.apiUrl}/desempleado/${idDesempleado}`)
    .pipe(
      tap((response:AuthResponse) => {
        if (response && response.StatusCode == 200) {
          this.removeData();
        }
      }),
      catchError(error => {
        console.error('Error al editar:', error);
        return of({ StatusCode: error.error.StatusCode, ReasonPhrase: error.error.ReasonPhrase, Message:  error.error.Message} as AuthResponse); // Ejemplo de manejo de error
      })
    );
  }

  //EMPRESA
  deleteEmployer(idEmpresa: number): Observable<AuthResponse>  {
    return this.http.delete<AuthResponse>(`${this.apiUrl}/empresa/${idEmpresa}`)
    .pipe(
      tap((response:AuthResponse) => {
        if (response && response.StatusCode == 200) {
          this.removeData();
        }
      }),
      catchError(error => {
        console.error('Error al editar:', error);
          return of({ StatusCode: error.error.StatusCode, ReasonPhrase: error.error.ReasonPhrase, Message:  error.error.Message} as AuthResponse); // Ejemplo de manejo de error
      })
    );
  }

  //TODOS LOS SECTORES PARA EL REGISTRO
  getSectores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sector`);
  }


  authUserBeforeRegister(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`);
  }

  //SOLO ES DE PRUEBA
  testAuth(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.get(`${this.apiUrl}/testAuth`, { headers });
  }


  //GENERALES
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey); // Recupera el token almacenado
  }

  private loadToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }


}
