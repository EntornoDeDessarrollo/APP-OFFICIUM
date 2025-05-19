import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

    //AGREGAR PDF
    addPost(formData: FormData): Observable<any>  {
      return this.http.post<any>(`${this.apiUrl}/publicacion`, formData);
    }

    getPostsUsuario(): Observable<any> {
      return this.http.get(`${this.apiUrl}/publicaciones/postsByUsuario`);
    }

    //DELETE
    deletePost(idPost: number): Observable<any>  {
      return this.http.delete<any>(`${this.apiUrl}/publicacion/${idPost}`);
    }

    //UPDATES
    updatePost(publicacion: number,formData: FormData): Observable<any>  {
      return this.http.post<any>(`${this.apiUrl}/publicacion/${publicacion}`, formData);
    }

    //LIKES
    likePost(idPublicacion:string): Observable<any> {idPublicacion
      return this.http.get<any>(`${this.apiUrl}/publicacion/${idPublicacion}/like`);
    }

    unlikePost(idPublicacion:string): Observable<any>  {
      return this.http.delete<any>(`${this.apiUrl}/publicacion/${idPublicacion}/unlike`);
    }


}
