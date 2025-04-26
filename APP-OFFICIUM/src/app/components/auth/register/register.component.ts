import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavComponent } from '../../sections/nav/nav.component';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [FormsModule, NavComponent, ReactiveFormsModule, CommonModule, SweetAlert2Module],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  // email: string = '';
  // password: string = '';
  message: string = '';
  isButtonDisabled: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]],
    password: ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')]]
 });


  register(){
    this.message='';
    this.isButtonDisabled = true;
    this.authService.register(this.form.value.email,this.form.value.password).subscribe({
      next:(response)=>{
        // Extraer el token de la respuesta y guardarlo en localStorage
        if (response.StatusCode === 201 && response.Data?.token) {
          this.authService.saveToken(response.Data.token);
          Swal.fire({
            title: "Registro exitoso",
            icon: "success",
            draggable: true
          });
          this.message = 'Registro exitoso';
          this.form.value.email = '';
          this.form.value.password = '';
          this.router.navigate(['/verify', response.Data.email]);
          this.isButtonDisabled = false;
        } else {
          Swal.fire({
            title: "Error al recuperar contraseña",
            icon: "error",
            draggable: true
          });
          this.message = 'Error en la registro';
          this.isButtonDisabled = false;
        }
      },
      error:(error)=>{
        console.error('Error en el registro:', error);
        if (error.status === 409 || error.status === 422) {
          Swal.fire({
            icon: "error",
            title: error.error.StatusCode,
            text: error.error.ReasonPhrase,
            footer: error.error.Message
          });
          this.message = error.error.ReasonPhrase;
          this.isButtonDisabled = false;
        }else {
          this.message = 'Error en el registro';
          this.isButtonDisabled = false;
        }
      },
      complete:()=>{
        this.isButtonDisabled = false;
      }
    });
  }



}
