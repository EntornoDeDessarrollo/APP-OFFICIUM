 import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NavComponent } from '../../sections/nav/nav.component';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-recover',
  imports: [FormsModule, NavComponent, ReactiveFormsModule, CommonModule, SweetAlert2Module],
  templateUrl: './recover.component.html',
  styleUrl: './recover.component.css'
})
export class RecoverComponent {

  // email: string = '';
  // emailConfirm: string = '';
  message: string = '';
  isButtonDisabled: boolean = false;

  constructor(private authService: AuthService) {}

  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]],
    emailConfirm: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]]
 }, { validators: RecoverComponent.equalsEmails() });

  //Crear funcion validacion de grupo.
  static equalsEmails(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.get('email');
      const emailConfirm = control.get('emailConfirm');

      if (email && emailConfirm && email.value !== emailConfirm.value) {
        return { emailsNotMatch: true }; // Devuelve un error si no coinciden
      }
      return null; // Devuelve null si coinciden
    };
  }


  recover() {
    this.message = '';
    this.isButtonDisabled = true;
    this.authService.recover(this.form.value.email).subscribe({
      next:(response) => {
        if (response.StatusCode === 200) {
          Swal.fire({
            icon: "success",
            title: "Registro Exitoso.",
            text: "Verifica tu correo electronico.",
            footer: 'Te hemos enviado un código de verificación'
          });
          this.message = 'Verifica tu correo electronico.';
          this.isButtonDisabled = false;
          // this.email = '';
        } else {
          Swal.fire({
            title: "Error al recuperar contraseña",
            icon: "error",
            draggable: true
          });
          this.message = 'Error al recuperar contraseña';
          this.isButtonDisabled = false;
        }
      },
      error:(error) => {
        console.error('Error en Recuperar Contraseña:', error);
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
      complete:()=>{this.isButtonDisabled = false;}
    });
  }

}
