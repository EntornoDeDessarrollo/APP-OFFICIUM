import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavComponent } from '../../sections/nav/nav.component';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-code',
  imports: [FormsModule, NavComponent, ReactiveFormsModule, CommonModule, SweetAlert2Module],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent implements OnInit{

  email: string = '';
  // code: string = '';
  message: string = '';
  isButtonDisabled: boolean = false;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}


  fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern('^\\d{6}$')]]
 });

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.email = params['email']; // Obtiene el email del parámetro de la ruta
    });
  }

  verifyCode(){
    this.message='';
    this.isButtonDisabled = true;
    this.authService.verifyCode(this.email,this.form.value.code).subscribe({
      next:(response)=>{
        // Extraer el token de la respuesta y guardarlo en localStorage
        if (response.StatusCode === 200) {
          this.router.navigate(['/newProfile']);
          Swal.fire({
            title: "Validación exitosa",
            icon: "success",
            draggable: true
          });
          this.message = 'Validación exitosa';
          this.email = '';
          this.form.value.code = '';

        } else {
          Swal.fire({
            title: "Error en la verificación",
            icon: "error",
            draggable: true
          });
          this.message = 'Error en la verificación';
          this.isButtonDisabled = false;
        }
      },
      error:(error)=>{
        console.error('Error en la verificación:', error);
        if (error.status === 422 || error.status === 404 || error.status === 400 || error.status === 500) {
          Swal.fire({
            icon: "error",
            title: error.error.StatusCode,
            text: error.error.ReasonPhrase,
            footer: error.error.Message
          });
          this.message = error.error.ReasonPhrase;
          this.isButtonDisabled = false;
        } else {
          this.message = `Error en la verificación ${error.status}`;
          this.isButtonDisabled = false;
        }
      },
      complete:()=>{this.isButtonDisabled = false;}
    });
  }

}
