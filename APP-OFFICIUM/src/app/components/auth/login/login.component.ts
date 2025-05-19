import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavComponent } from '../../sections/nav/nav.component';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NavComponent,RouterLink, ReactiveFormsModule, CommonModule, SweetAlert2Module],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  message: string = '';
  isButtonDisabled: boolean = false;

  //Hay que añadir el constructor y injectar el servicio auth
  constructor(private authService: AuthService, private router: Router) {}

  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]],
    password: ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')]]
 });

  login() {
    this.message = '';
    this.isButtonDisabled = true;
    this.authService.login(this.form.value.email, this.form.value.password).subscribe({
      next:(response) => {
        console.log('Login exitoso:', response);

        // Extraer el token de la respuesta y guardarlo en localStorage
        if (response.StatusCode === 200 && response.Data?.token) {
          Swal.fire({
            title: "Login exitoso",
            icon: "success",
            draggable: true
          });
          this.message = 'Login exitoso';
          this.form.value.email = '';
          this.form.value.password = '';
          this.isButtonDisabled = false;
          this.router.navigate(['/kick-off']);
        } else {
          Swal.fire({
            title: response.Message,
            text: response.ReasonPhrase,
            footer: response.StatusCode,
            icon: "error",
            draggable: true
          });
          this.message = 'Error en la autenticación';
          this.isButtonDisabled = false;
        }
      },
      error:(error) => {
        console.error('Error en login:', error);
        if (error.status === 422 || error.status === 404 || error.status === 500) {
          Swal.fire({
            icon: "error",
            title: error.error.StatusCode,
            text: error.error.ReasonPhrase,
            footer: error.error.Message
          });
          this.message = error.error.ReasonPhrase;
          this.isButtonDisabled = false;
        }
      },
      complete: () => {
        console.log('Login completado');
        this.isButtonDisabled = false;
      }
    });
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
        this.message = 'Sesión cerrada correctamente';
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

  testAuth() {
    this.authService.testAuth().subscribe({
      next:(response) => {
        console.log('Prueba de autenticación:', response);
        this.message = 'Token válido';
      },
      error:(error) => {
        console.error('Error en testAuth:', error);
        this.message = 'Token inválido';
      }
    });
  }

  checkToken(){
    const token = this.authService.getToken();
    if (token) {
      this.message = `Token guardado: ${token}`;
    } else {
      this.message = 'No hay token guardado en localStorage.';
    }
  }
}
