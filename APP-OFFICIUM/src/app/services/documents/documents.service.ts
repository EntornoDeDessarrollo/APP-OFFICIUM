import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse } from '../../interface/auth/auth';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }


  //AGREGAR FOTO
  addFoto(formData: FormData): Observable<any>  {
    return this.http.post<any>(`${this.apiUrl}/documento`, formData)
    .pipe(
      tap((response:any) => {
        if (response) {

        }
      }),
      catchError(error => {
        console.error('Error al editar:', error);
          return of({ StatusCode: error.error.StatusCode, ReasonPhrase: error.error.ReasonPhrase, Message:  error.error.Message} as AuthResponse); // Ejemplo de manejo de error
      })
    );
  }

  //AGREGAR PDF
  addPdf(formData: FormData): Observable<any>  {
    return this.http.post<any>(`${this.apiUrl}/documento`, formData);
  }

  //AGREGAR PDF
  addVideo(formData: FormData): Observable<any>  {
    return this.http.post<any>(`${this.apiUrl}/documento`, formData);
  }


  //GETS
  getFotosUsuario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/documentos/fotosByIDUsuario`);
  }

  getPdfsUsuario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/documentos/pdfsByIDUsuario`);
  }

  getVideoUsuario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/documentos/videosByIDUsuario`);
  }

  //UPDATES
  updateDocument(idDocument: number,formData: FormData): Observable<any>  {
    return this.http.post<any>(`${this.apiUrl}/documento/${idDocument}`, formData);
  }

  //DELE
  deleteDocument(idDocument: number): Observable<any>  {
    return this.http.delete<any>(`${this.apiUrl}/documento/${idDocument}`);
  }
}
