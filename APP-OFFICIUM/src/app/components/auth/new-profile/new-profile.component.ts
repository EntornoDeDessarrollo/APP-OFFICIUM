import { Component, inject, OnInit } from '@angular/core';
import { NavComponent } from '../../sections/nav/nav.component';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { NgFor, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-profile',
  imports: [NavComponent, NgIf, NgFor, ReactiveFormsModule,FormsModule],
  templateUrl: './new-profile.component.html',
  styleUrl: './new-profile.component.css'
})
export class NewProfileComponent implements OnInit{

  tipoUsuario: string = 'desempleado';
  disponibilidades: string[] = ['Tiempo completo', 'Medio tiempo', 'Por horas', 'Freelance'];
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = "assets/default.jpg";
  sectores: any[] = [];
  isButtonDisabled: boolean = false;

  constructor( private authService: AuthService, private router: Router) {}


  fb = inject(FormBuilder);

  formDesempleado: FormGroup = this.fb.group({

    nombre: ['',[Validators.required,Validators.minLength(3)]],
    apellido: ['',[Validators.required,Validators.minLength(3)]],
    dni: ['',[Validators.required,NewProfileComponent.dniValidator()]],
    portafolios: ['',[Validators.required, this.urlValidator]],
    disponibilidad: ['',[Validators.required]],
    foto: ['',[Validators.required]],
  },);

  formEmpresa: FormGroup = this.fb.group({

    nombreEmpresa: ['',[Validators.required,Validators.minLength(3)]],
    nif: ['',[Validators.required,NewProfileComponent.cifValidator()]],
    idSector: ['',[Validators.required]],
    ubicacion: ['',[Validators.required,Validators.minLength(3)]],
    sitioWeb: ['',[Validators.required,this.urlValidator]],
    foto: ['',[Validators.required]],
  });

  static cifValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.toUpperCase();
      if (!value) {
        return { invalidFormat: true };
      }

      const cifRegex = new RegExp('^[ABCDEFGHPQSX]\\d{7}[0-9A-J]$');
      if (!cifRegex.test(value)) {
        return { invalidFormat: true };
      }

      const primeraLetra = value.charAt(0);
      const numBase = value.substring(1, 8);
      const digitoControl = value.charAt(8);

      let sumaPares = 0;
      let sumaImpares = 0;

      for (let i = 0; i < numBase.length; i++) {
        const digito = parseInt(numBase.charAt(i), 10);
        if ((i + 1) % 2 === 0) { // Posición par
          sumaPares += digito;
        } else { // Posición impar
          let producto = 2 * digito;
          if (producto > 9) {
            sumaImpares += Math.floor(producto / 10) + (producto % 10);
          } else {
            sumaImpares += producto;
          }
        }
      }

      const sumaTotal = sumaPares + sumaImpares;
      let digitoCalculado = 10 - (sumaTotal % 10);
      if (digitoCalculado === 10) {
        digitoCalculado = 0;
      }
      const digitoControlEsperadoNum = digitoCalculado.toString();
      let digitoControlEsperadoLetra = '';

      if (['P', 'Q', 'S'].includes(primeraLetra)) {
        const letrasControl = 'JABCDEFGHI';
        digitoControlEsperadoLetra = letrasControl.charAt(digitoCalculado);
        if (digitoControl !== digitoControlEsperadoLetra) {
          return { invalidControlDigit: true };
        }
      } else if (primeraLetra === 'X') {
        const letrasControl = 'KLMNOPQRSTUVWXYZ';
        if (digitoCalculado >= 0 && digitoCalculado < letrasControl.length) {
          digitoControlEsperadoLetra = letrasControl.charAt(digitoCalculado);
          if (digitoControl !== digitoControlEsperadoLetra) {
            return { invalidControlDigit: true };
          }
        } else {
          return { invalidControlDigit: true }; // Dígito calculado fuera de rango para letra X
        }
      } else {
        if (digitoControl !== digitoControlEsperadoNum) {
          return { invalidControlDigit: true };
        }
      }

      return null;
    };
  }


  static dniValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.toUpperCase();
      if (!value) return { invalidFormat: true };

      const dniRegex = new RegExp('^\\d{8}[A-Z]$');
      const nieRegex = new RegExp('^[XYZ]\\d{7}[A-Z]$');

      const validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
      let numberPart: number;
      let expectedLetter: string;
      const letter = value.slice(-1);

      // NIE
      if (nieRegex.test(value)) {
        let firstChar = value.charAt(0);
        let numericPrefix = firstChar === 'X' ? '0' : firstChar === 'Y' ? '1' : '2';
        numberPart = parseInt(numericPrefix + value.substring(1, 8), 10);
        expectedLetter = validLetters.charAt(numberPart % 23);
        if (letter !== expectedLetter) return { invalidLetter: true };
        console.log("Validar NIE");
        return null;
      }

      // DNI
      if (dniRegex.test(value)) {
        numberPart = parseInt(value.slice(0, 8), 10);
        expectedLetter = validLetters.charAt(numberPart % 23);
        if (letter !== expectedLetter) return { invalidLetter: true };
        console.log("Validar DNI");
        return null;
      }
      // Ni DNI ni NIE válidos
      return { invalidFormat: true };
    }
  }

  static nifValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.toUpperCase();
      if (!value) return { invalidFormat: true };

      const dniRegex = new RegExp('^\\d{8}[A-Z]$');

      const validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';
      let numberPart: number;
      let expectedLetter: string;
      const letter = value.slice(-1);

      // NIF
      if (dniRegex.test(value)) {
        numberPart = parseInt(value.slice(0, 8), 10);
        expectedLetter = validLetters.charAt(numberPart % 23);
        if (letter !== expectedLetter) return { invalidLetter: true };

        return null;
      }

      return { invalidFormat: true };
    }
  }

  urlValidator(control: AbstractControl): ValidationErrors | null {

    const urlPattern = new RegExp('^(https?:\\/\\/)?([\\w\\-]+\\.)+[\\w\\-]{2,}(\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*)?$');
    return urlPattern.test(control.value) ? null : { invalidUrl: true };
  }


  ngOnInit() {
    this.obtenerSectores();
  }

  alternarTipoUsuario(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.tipoUsuario = isChecked ? 'empresa' : 'desempleado';
    this.resetCampos();
  }

  resetCampos() {
    console.log(this.tipoUsuario);
    // Limpia los campos no necesarios
    if (this.tipoUsuario === 'empresa') {

      this.formEmpresa.get('nombreEmpresa')?.setValue('');
      this.formEmpresa.get('nif')?.setValue('');
      this.formEmpresa.get('idSector')?.setValue('');
      this.formEmpresa.get('ubicacion')?.setValue('');
      this.formEmpresa.get('sitioWeb')?.setValue('');
      this.formEmpresa.get('foto')?.setValue('');

      this.imagePreview = "assets/default.jpg";

    } else if (this.tipoUsuario === 'desempleado') {

      this.formDesempleado.get('nombre')?.setValue('');
      this.formDesempleado.get('apellido')?.setValue('');
      this.formDesempleado.get('dni')?.setValue('');
      this.formDesempleado.get('portafolios')?.setValue('');
      this.formDesempleado.get('sitioWeb')?.setValue('');
      this.formDesempleado.get('disponibilidad')?.setValue('');
      this.formDesempleado.get('foto')?.setValue('');

      this.imagePreview = "assets/default.jpg";
    }

    this.formDesempleado.updateValueAndValidity();
    this.formEmpresa.updateValueAndValidity();
  }

  obtenerSectores() {
    this.authService.getSectores().subscribe((data) => {
      this.sectores = data.Data;
      console.log(this.sectores)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
    else {
      this.selectedFile = null; // Limpia la selección si el usuario cancela
      this.imagePreview = null;
    }
  }

   registrar() {
    this.isButtonDisabled = true;
    const formData = new FormData();
    if (this.tipoUsuario === 'desempleado') {

      // Agregar campos
      formData.append('Nombre', this.formDesempleado.get('nombre')?.value);
      formData.append('Apellido', this.formDesempleado.get('apellido')?.value);
      formData.append('DNI', this.formDesempleado.get('dni')?.value);
      formData.append('Porfolios', this.formDesempleado.get('portafolios')?.value);
      formData.append('Disponibilidad', this.formDesempleado.get('disponibilidad')?.value);

      // Agregar archivo
      if (this.selectedFile) {
        formData.append('Foto', this.selectedFile);
      }

      this.authService.newUnemployed(formData).subscribe({
        next:(response) => {
          if (response.StatusCode === 200) {
            Swal.fire({
              icon: "success",
              title: response.ReasonPhrase,
              text: response.Message,
              footer: response.StatusCode
            }).then(() => {
              this.isButtonDisabled = false;
              this.borrarTokenRegistro();
            });
          } else {
            Swal.fire({
              title: "Error",
              icon: "error",
              draggable: true
            });
            this.isButtonDisabled = false;
          }
        },
        error:(error) => {
          if (error.status === 422 || error.status === 404 || error.status === 500) {
            Swal.fire({
              icon: "error",
              title: error.error.StatusCode,
              text: error.error.ReasonPhrase,
              footer: error.error.Message
            });

            this.isButtonDisabled = false;
          }
          Swal.fire({
            icon: "error",
            title: error.error.StatusCode,
            text: error.error.ReasonPhrase,
            footer:error.error.Message
          });
        },
        complete:()=>{this.isButtonDisabled = false;}
      });



    } else if (this.tipoUsuario === 'empresa') {
      // Agregar campos
      formData.append('IDUsuario', this.formEmpresa.get('nombreEmpresa')?.value);
      formData.append('NombreEmpresa', this.formEmpresa.get('nombreEmpresa')?.value);
      formData.append('CIF', this.formEmpresa.get('nif')?.value);
      formData.append('IDSector', this.formEmpresa.get('idSector')?.value);
      formData.append('Ubicacion', this.formEmpresa.get('ubicacion')?.value);
      formData.append('SitioWeb', this.formEmpresa.get('sitioWeb')?.value);

      // Agregar archivo
      if (this.selectedFile) {
        formData.append('Foto', this.selectedFile);
      }

      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }

      this.authService.newEmployer(formData).subscribe({
        next:(response) => {
          if (response.StatusCode === 200) {
            Swal.fire({
              icon: "success",
              title: response.ReasonPhrase,
              text: response.Message,
              footer: response.StatusCode
            }).then(() => {
              this.isButtonDisabled = false;
              this.borrarTokenRegistro();
            });
          } else {
            Swal.fire({
              title: "Error",
              icon: "error",
              draggable: true
            });
            this.isButtonDisabled = false;
          }
        },
        error:(error) => {
          console.log("eROOR: "+error.status);
          if (error.status === 422 || error.status === 404 || error.status === 500 || error.status == 409) {
            Swal.fire({
              icon: "error",
              title: error.error.StatusCode,
              text: error.error.ReasonPhrase,
              footer: error.error.Message
            });


          }
          Swal.fire({
            icon: "error",
            title: error.error.StatusCode,
            text: error.error.ReasonPhrase,
            footer:error.error.Message
          });
        },
        complete:()=>{this.isButtonDisabled = false;}
      });
    }
   }

   borrarTokenRegistro() {
    this.authService.logout().subscribe({
      next:() => {
        this.authService.removeToken();
        this.router.navigate(['/login']);
      },
      error:(error) => {
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
