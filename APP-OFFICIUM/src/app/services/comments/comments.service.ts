import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }


  //AGREGAR COMENTARIO
  addComentario(IDPublicacion: string,formData: FormData): Observable<any>  {
    return this.http.post<any>(`${this.apiUrl}/comentario`, formData);
  }

  //UPDATES
  updateComment(IDPublicacion: number,formData: FormData): Observable<any>  {
    return this.http.post<any>(`${this.apiUrl}/comentario/${IDPublicacion}`, formData);
  }

  //DELETE
  deleteComment(IDPublicacion: number): Observable<any>  {
    return this.http.delete<any>(`${this.apiUrl}/comentario/${IDPublicacion}`);
  }

}
