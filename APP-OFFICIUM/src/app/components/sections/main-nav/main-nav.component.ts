import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../services/auth/auth.service';

import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-nav',
  imports: [FontAwesomeModule,RouterLink, CommonModule],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.css'
})
export class MainNavComponent {
  faHome = faHome;
  faBell = faBell;
  nombre$!: Observable<string>;
  fotoPerfil$!: Observable<string|null>;

  constructor(private authService: AuthService, private router: Router){
    this.fotoPerfil$ = this.authService.getFotoPerfil$();
    this.nombre$ = this.authService.getNombre$();
  }

   logout() {
      this.authService.logout().subscribe({
        next:(response) => {
          console.log('Sesión cerrada');

          Swal.fire({
            title: "Sesión cerrada correctamente",
            icon: "success",
            draggable: true
          });
          this.router.navigate(['/home']);
        },
        error:(error) => {
          console.error('Error al cerrar sesión:', error);
          Swal.fire({
            title: error.error.message,
            icon: "error",
            draggable: true
          });
          this.router.navigate(['/home']);
        }
      });
    }

}
