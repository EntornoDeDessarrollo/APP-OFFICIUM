import { Component, inject, OnInit } from '@angular/core';
import { MainNavComponent } from "../sections/main-nav/main-nav.component";
import { RegisterComponent } from "../auth/register/register.component";
import { NewProfileComponent } from '../auth/new-profile/new-profile.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from 'rxjs';

import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DocumentsService } from '../../services/documents/documents.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { faComment, faFaceLaugh, faFileImage, faPlus, faShare, faThumbsUp,faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PostsService } from '../../services/post/posts.service';
import { SafePipePipe } from '../../safe-pipe.pipe';
import { CommentsService } from '../../services/comments/comments.service';



@Component({
  selector: 'app-profile',
  imports: [MainNavComponent, CommonModule, ReactiveFormsModule, FontAwesomeModule, SafePipePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{


  //ICONOS
  faPlus = faPlus;
  faVideo = faVideo;
  faFile = faFile;
  faImage = faImage;
  faThumbsUp = faThumbsUp;
  faComment = faComment;
  faShare = faShare;
  faFaceLaugh = faFaceLaugh;
  faFileImage = faFileImage;
  faEllipsis = faEllipsis;

  //VARIBLES PARA LOS PERFILES
  imagePreview: string | ArrayBuffer | null = "assets/default.jpg";
  selectedFile: File | null = null;
  sectores: any[] = [];
  disponibilidades: string[] = ['Tiempo completo', 'Medio tiempo', 'Por horas', 'Freelance'];
  fotoPerfil$!: Observable<string|null>;
  nombre$!: Observable<string>;
  isEmpresa$!: Observable<boolean>;
  isDesempleado$!: Observable<boolean>;

  //VARIBLES PARA LAS FOTOS
  imagePreviewFoto: string | ArrayBuffer | null = "assets/imgDefault.png";
  selectedFileFoto: File | null = null;
  fotos: any[] = [];

  //VARIBLES PARA LOS DOCUMENTOS
  imagePreviewPdf: string | ArrayBuffer | null = "assets/pdfDefault.png";
  selectedFilePdf: File | null = null;
  Pdfs: any[] = [];
  selectedPdfUrl: SafeResourceUrl | null = null;
  selectedPdfId: string = '';
  selectedPdfDetails: any = null;

  //VARIBLES PARA LAS VIDEOS
  imagePreviewVideo: string | ArrayBuffer | null = "assets/videoDefault.png";
  selectedFileVideo: File | null = null;
  videos: any[] = [];
  selectedVideoUrl: SafeResourceUrl | null = null;
  isPlaying: { [key: string]: boolean } = {}; // Objeto para rastrear si un video debe reproducirse

  //VARIABLES PARA PUBLICACIONES
  selectedFileArchivo: File | null = null;
  imagePreviewPost: string | ArrayBuffer | null = "";
  imagePreviewArchivo: string | ArrayBuffer | null = "";
  typeArchivo: string = '';
  posts: any[] = [];

  //VARIABLES COMENTARIOS
  selectedComentario: any | null = null;


  //VARIABLES GENERALES
  isButtonDisabled: boolean = false;



  //COSTRUCTOR
  constructor(
    private authService: AuthService,
    private router: Router,
    private documentService: DocumentsService,
    private sanitizer: DomSanitizer,
    private postService: PostsService,
    private commentService: CommentsService
  ){
    this.fotoPerfil$ = this.authService.getFotoPerfil$();
    this.nombre$ = this.authService.getNombre$();

    this.isEmpresa$ = this.authService.isEmpresa$;
    this.isDesempleado$ = this.authService.isDesempleado$;
  }


  //FORMULARIOS
  fb = inject(FormBuilder);

  formEmpresa: FormGroup = this.fb.group({

    nombreEmpresa: ['',[Validators.required,Validators.minLength(3)]],
    nif: ['',[Validators.required,NewProfileComponent.cifValidator()]],
    idSector: ['',[Validators.required]],
    ubicacion: ['',[Validators.required,Validators.minLength(3)]],
    sitioWeb: ['',[Validators.required,this.urlValidator]],
    foto: [''],
  });

  formDesempleado: FormGroup = this.fb.group({

    nombre: ['',[Validators.required,Validators.minLength(3)]],
    apellido: ['',[Validators.required,Validators.minLength(3)]],
    dni: ['',[Validators.required,NewProfileComponent.dniValidator()]],
    portafolios: ['',[Validators.required, this.urlValidator]],
    disponibilidad: ['',[Validators.required]],
    foto: [''],
  },);

  formFoto: FormGroup = this.fb.group({
    descricion: ['',[Validators.required,Validators.minLength(3)]],
    foto: ['',[Validators.required]],
  });

  formPdf: FormGroup = this.fb.group({
    descripcion: ['',[Validators.required,Validators.minLength(3)]],
    archivo: ['',[Validators.required]],
  });

  formVideo: FormGroup = this.fb.group({
    descripcion: ['',[Validators.required,Validators.minLength(3)]],
    video: ['',[Validators.required]],
  });

  formPost: FormGroup = this.fb.group({
    contenido: ['',[Validators.required,Validators.minLength(3)]],
    archivo: [''],
  });

  formComentario: FormGroup = this.fb.group({
    contenido: ['',[Validators.required,Validators.minLength(1)]],
  });


  ngOnInit(): void {

    this.obtenerSectores();

    this.loadFotosUsuario();

    this.loadPdfsUsuario();

    this.loadVideoUsuario();

    this.loadPostUsuario();

    //this,loadCommetsPostOAlgoAsi();


    //this.loadPublicacionesUsuario();

    this.authService.profile$.subscribe(profile => {
      if (profile && this.authService.isEmpresaProfile(profile)) {
        this.formEmpresa.patchValue({
          nombreEmpresa: profile.NombreEmpresa || '',
          nif: profile.CIF || '',
          idSector: profile.IDSector || '',
          ubicacion: profile.Ubicacion || '',
          sitioWeb: profile.SitioWeb || '',
          // No precargamos la foto aquí, ya que usualmente se maneja de forma diferente para edición
        });
        if (profile.Foto) {
            this.imagePreview = `http://127.0.0.1:8000/${profile.Foto}`; // Precargamos la imagen existente
        }
      } else if (profile &&  this.authService.isDesempleadoProfile(profile)) {
        this.formDesempleado.patchValue({
          nombre: profile.Nombre || '',
          apellido: profile.Apellido || '',
          dni: profile.DNI || '',
          portafolios: profile.Porfolios || '',
          disponibilidad: profile.Disponibilidad || '',
          // No precargamos la foto aquí
        });
        if (profile.Foto) {
          this.imagePreview = `http://127.0.0.1:8000/${profile.Foto}`; // Precargamos la imagen existente
        }
      }
    });

    this.isButtonDisabled = false;
  }

  //VALIDADORES
  urlValidator(control: AbstractControl): ValidationErrors | null {

    const urlPattern = new RegExp('^(https?:\\/\\/)?([\\w\\-]+\\.)+[\\w\\-]{2,}(\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*)?$');
    return urlPattern.test(control.value) ? null : { invalidUrl: true };
  }

  //IMG SUPPORT
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

  onFileSelectedFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFileFoto = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewFoto = reader.result;
      };
      reader.readAsDataURL(this.selectedFileFoto);
    }
    else {
      this.selectedFileFoto = null; // Limpia la selección si el usuario cancela
      this.imagePreviewFoto = null;
    }
  }

  onFileSelectedPdf(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFilePdf = input.files[0];
    }
    else {
      this.selectedFileFoto = null; // Limpia la selección si el usuario cancela
    }
  }

  onFileSelectedVideo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFileVideo = input.files[0];
    }
    else {
      this.selectedFileVideo = null; // Limpia la selección si el usuario cancela

    }
  }

  onFileSelectedPost(event: Event, tipo: string): void {
    const input = event.target as HTMLInputElement;

    this.typeArchivo = tipo;



    if (input.files && input.files[0]) {
      this.selectedFileArchivo = input.files[0];
      if(tipo == 'Foto'){
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewPost = reader.result;
        };
        reader.readAsDataURL(this.selectedFileArchivo);
      }
      else if(tipo == 'Video'){
        this.imagePreviewPost = "assets/videoDefault.png";
      }
      else if(tipo == 'PDF'){
         this.imagePreviewPost = "assets/pdfDefault.png";
      }
      }
    else {
      this.selectedFileArchivo = null; // Limpia la selección si el usuario cancela
    }
  }


  obtenerSectores() {
    this.authService.getSectores().subscribe((data) => {
      this.sectores = data.Data;
    });
  }

  //CRUDS PERFILES
  update() {

    this.isButtonDisabled = true;
    const formData = new FormData();

    const currentProfile = this.authService.getProfile();

    if (this.authService.isDesempleadoProfile(currentProfile)) {

      // Agregar campos
      formData.append('Nombre', this.formDesempleado.get('nombre')?.value);
      formData.append('Apellido', this.formDesempleado.get('apellido')?.value);
      formData.append('DNI', this.formDesempleado.get('dni')?.value);
      formData.append('Porfolios', this.formDesempleado.get('portafolios')?.value);
      formData.append('Disponibilidad', this.formDesempleado.get('disponibilidad')?.value);
      formData.append('_method', 'PUT');

      // Agregar archivo
      if (this.selectedFile) {
        formData.append('Foto', this.selectedFile);
      }

      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }
      this.authService.updateUnemployed(currentProfile.IDDesempleado,formData).subscribe({
        next:(response) => {
          if (response.StatusCode === 200) {
            Swal.fire({
              icon: "success",
              title: response.ReasonPhrase,
              text: response.Message,
              footer: response.StatusCode
            }).then(() => {
              this.isButtonDisabled = false;
            });
          } else {
            Swal.fire({
              icon: "error",
              title: response.ReasonPhrase,
              text: response.Message,
              draggable: true,
              footer: response.StatusCode
            });
            this.isButtonDisabled = false;
          }
        },
        error:(error) => {
          if (error.status === 422 || error.status === 404 || error.status === 500 || error.status == 409) {
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

    }
    else if (this.authService.isEmpresaProfile(currentProfile)) {
      // Agregar campos
      //formData.append('IDUsuario', this.formEmpresa.get('nombreEmpresa')?.value);
      formData.append('NombreEmpresa', this.formEmpresa.get('nombreEmpresa')?.value);
      formData.append('CIF', this.formEmpresa.get('nif')?.value);
      formData.append('IDSector', this.formEmpresa.get('idSector')?.value);
      formData.append('Ubicacion', this.formEmpresa.get('ubicacion')?.value);
      formData.append('SitioWeb', this.formEmpresa.get('sitioWeb')?.value);
      formData.append('_method', 'PUT');

      // Agregar archivo
      if (this.selectedFile) {
        formData.append('Foto', this.selectedFile);
      }

      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }

      this.authService.updateEmployer(currentProfile.IDEmpresa,formData).subscribe({
        next:(response) => {
          if (response.StatusCode === 200) {
            Swal.fire({
              icon: "success",
              title: response.ReasonPhrase,
              text: response.Message,
              footer: response.StatusCode
            }).then(() => {
              this.isButtonDisabled = false;

            });
          } else {
            Swal.fire({
              icon: "error",
              title: response.ReasonPhrase,
              text: response.Message,
              draggable: true,
              footer: response.StatusCode
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

  delete(){

    Swal.fire({
      title: "Estas seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#FF5733",
      cancelButtonText:"Cancelar",
      confirmButtonText: "Si, Eliminar!"
    }).then((result) => {
      if (result.isConfirmed) {

        const currentProfile = this.authService.getProfile();

        if (this.authService.isDesempleadoProfile(currentProfile)) {
          this.authService.deleteUnemployed(currentProfile.IDDesempleado).subscribe({
            next:(response) => {
              if (response.StatusCode === 200) {
                Swal.fire({
                  icon: "success",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  footer: response.StatusCode
                }).then(() => {
                  this.router.navigate(['/home']);
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  draggable: true,
                  footer: response.StatusCode
                });

              }
            },
            error:(error) => {
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
            complete:()=>{}
          });
        }

        else if (this.authService.isEmpresaProfile(currentProfile)) {
          this.authService.deleteEmployer(currentProfile.IDEmpresa).subscribe({
            next:(response) => {
              if (response.StatusCode === 200) {
                Swal.fire({
                  icon: "success",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  footer: response.StatusCode
                }).then(() => {
                  this.router.navigate(['/home']);
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  draggable: true,
                  footer: response.StatusCode
                });

              }
            },
            error:(error) => {
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
            complete:()=>{}
          });
        }






      }
    });
  }

  //CRUDS FOTOS
  addFoto(){

    this.isButtonDisabled = true;
    const formData = new FormData();

    // Agregar campos
    formData.append('Tipo','Foto');
    formData.append('Descripcion', this.formFoto.get('descricion')?.value);

    // Agregar archivo
    if (this.selectedFileFoto) {
      formData.append('Archivo', this.selectedFileFoto);
    }

    this.documentService.addFoto(formData).subscribe({
            next:(response) => {
              if (response.StatusCode === 201) {
                Swal.fire({
                  icon: "success",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  footer: response.StatusCode
                }).then(() => {
                  this.isButtonDisabled = false;
                  this.loadFotosUsuario();
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
            complete:()=>{
              this.isButtonDisabled = false;
              this.resetFormFoto();
            }
    });



  }

  resetFormFoto() {

    this.formFoto.get('descricion')?.setValue('');
    this.formFoto.get('descricion')?.markAsUntouched();
    this.formFoto.get('descricion')?.markAsPristine();

    this.formFoto.get('foto')?.setValue('');
    this.formFoto.get('foto')?.markAsUntouched();
    this.formFoto.get('foto')?.markAsPristine();


    this.imagePreviewFoto = "assets/imgDefault.png";


  }

  loadFotosUsuario(): void {
    this.documentService.getFotosUsuario().subscribe({
      next: (response) => {
        if (response.StatusCode === 200) {
          this.fotos = response.Data; // Asignamos la propiedad 'data' a la variable 'fotos'
        } else {
          console.error('Error al cargar las fotos:', response);
        }
      },
      error: (error) => {
        console.error('Error en la petición de fotos:', error);
      }
    });
  }

  openEditFotoModal(foto: any): void {
     this.imagePreviewFoto = `http://127.0.0.1:8000${foto.URL}`;
    this.formFoto.patchValue({
      descricion: foto.Descripcion
    });
  }

  editFoto(idDocuemto:any): void {

    if (this.formFoto.valid && this.selectedFileFoto) {


      const formData = new FormData();

      formData.append('_method', 'PUT');
      formData.append('Descripcion', this.formFoto.get('descricion')?.value);
      if (this.selectedFileFoto) {
        formData.append('Archivo', this.selectedFileFoto);
      }
      this.documentService.updateDocument(idDocuemto,formData).subscribe({
        next:(response) => {
          if (response.StatusCode === 200) {
            Swal.fire({
              icon: "success",
              title: response.ReasonPhrase,
              text: response.Message,
              footer: response.StatusCode
            }).then(() => {

              this.resetFormFoto();
              this.loadFotosUsuario();
            });
          } else {
            Swal.fire({
              icon: "error",
              title: response.ReasonPhrase,
              text: response.Message,
              draggable: true,
              footer: response.StatusCode
            });

          }
        },
        error:(error) => {
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
        complete:()=>{}
      });
    }
  }

  deleteFoto(idDocuemto:any){

    Swal.fire({
      title: "Estas seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#FF5733",
      cancelButtonText:"Cancelar",
      confirmButtonText: "Si, Eliminar!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.documentService.deleteDocument(idDocuemto).subscribe({
          next:(response) => {
            if (response.StatusCode === 200) {
              Swal.fire({
                icon: "success",
                title: response.ReasonPhrase,
                text: response.Message,
                footer: response.StatusCode
              }).then(() => {
                this.loadFotosUsuario();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: response.ReasonPhrase,
                text: response.Message,
                draggable: true,
                footer: response.StatusCode
              });

            }
          },
          error:(error) => {
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
          complete:()=>{}
        });

      }
    });
  }

  //CRUDS DOCUMENTOS
  addPdf(){

    this.isButtonDisabled = true;
    const formData = new FormData();

    // Agregar campos
    formData.append('Tipo','PDF');
    formData.append('Descripcion', this.formPdf.get('descripcion')?.value);

    // Agregar archivo
    if (this.selectedFilePdf) {
      formData.append('Archivo', this.selectedFilePdf);
    }

    this.documentService.addPdf(formData).subscribe({
            next:(response) => {
              if (response.StatusCode === 201) {
                Swal.fire({
                  icon: "success",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  footer: response.StatusCode
                }).then(() => {
                  this.isButtonDisabled = false;
                 this.loadPdfsUsuario();
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
            complete:()=>{
              this.isButtonDisabled = false;
              this.resetFormPdf();
            }
    });
  }

  resetFormPdf() {
    this.formPdf.get('descripcion')?.setValue('');
    this.formPdf.get('descripcion')?.markAsUntouched();
    this.formPdf.get('descripcion')?.markAsPristine();

    this.formPdf.get('archivo')?.setValue('');
    this.formPdf.get('archivo')?.markAsUntouched();
    this.formPdf.get('archivo')?.markAsPristine();

    this.imagePreviewFoto = "assets/pdfDefault.png";
  }

  loadPdfsUsuario(): void {
    this.documentService.getPdfsUsuario().subscribe({
      next: (response) => {
        if (response.StatusCode === 200) {
          this.Pdfs = response.Data; // Asignamos la propiedad 'data' a la variable
          console.log('Pdfs:', response);

        } else {
          console.error('Error al cargar los pdfs:', response);
        }
      },
      error: (error) => {
        console.error('Error en la petición de pdfs:', error);
      }
    });
  }

  openEditPdfModal(pdf: any): void {

    this.formPdf.patchValue({
      descripcion: pdf.Descripcion
    });
  }

  openVerPdfModal(pdf: any): void {

    this.selectedPdfId = pdf.IDDocumento;
    this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://127.0.0.1:8000' + pdf.URL);
    this.selectedPdfDetails = pdf;

  }

  deletePdf(idDocuemto:any){

    Swal.fire({
      title: "Estas seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#FF5733",
      cancelButtonText:"Cancelar",
      confirmButtonText: "Si, Eliminar!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.documentService.deleteDocument(idDocuemto).subscribe({
          next:(response) => {
            if (response.StatusCode === 200) {
              Swal.fire({
                icon: "success",
                title: response.ReasonPhrase,
                text: response.Message,
                footer: response.StatusCode
              }).then(() => {
                this.loadPdfsUsuario();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: response.ReasonPhrase,
                text: response.Message,
                draggable: true,
                footer: response.StatusCode
              });

            }
          },
          error:(error) => {
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
          complete:()=>{}
        });

      }
    });
  }

  editPdf(idDocuemto:any): void {

    if (this.formPdf.valid && this.selectedFilePdf) {


      const formData = new FormData();

      formData.append('_method', 'PUT');
      formData.append('Descripcion', this.formPdf.get('descripcion')?.value);
      if (this.selectedFilePdf) {
        formData.append('Archivo', this.selectedFilePdf);
      }
      this.documentService.updateDocument(idDocuemto,formData).subscribe({
        next:(response) => {
          if (response.StatusCode === 200) {
            Swal.fire({
              icon: "success",
              title: response.ReasonPhrase,
              text: response.Message,
              footer: response.StatusCode
            }).then(() => {

              this.resetFormPdf();
              this.loadPdfsUsuario();
            });
          } else {
            Swal.fire({
              icon: "error",
              title: response.ReasonPhrase,
              text: response.Message,
              draggable: true,
              footer: response.StatusCode
            });

          }
        },
        error:(error) => {
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
        complete:()=>{}
      });
    }
  }


  //CRUDS VIDEOS
  addVideo(){

    this.isButtonDisabled = true;
    const formData = new FormData();

    // Agregar campos
    formData.append('Tipo','Video');
    formData.append('Descripcion', this.formVideo.get('descripcion')?.value);

    // Agregar archivo
    if (this.selectedFileVideo) {
      formData.append('Archivo', this.selectedFileVideo);
    }

    this.documentService.addVideo(formData).subscribe({
            next:(response) => {
              if (response.StatusCode === 201) {
                Swal.fire({
                  icon: "success",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  footer: response.StatusCode
                }).then(() => {
                  this.isButtonDisabled = false;
                  this.loadVideoUsuario();
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
            complete:()=>{
              this.isButtonDisabled = false;
              this.resetFormVideo();
            }
    });
  }

  resetFormVideo() {
    this.formVideo.get('descripcion')?.setValue('');
    this.formVideo.get('descripcion')?.markAsUntouched();
    this.formVideo.get('descripcion')?.markAsPristine();

    this.formVideo.get('archivo')?.setValue('');
    this.formVideo.get('archivo')?.markAsUntouched();
    this.formVideo.get('archivo')?.markAsPristine();

    this.imagePreviewVideo = "assets/videoDefault.png";
  }

  loadVideoUsuario(): void {
    this.documentService.getVideoUsuario().subscribe({
      next: (response) => {
        if (response.StatusCode === 200) {
          this.videos = response.Data; // Asignamos la propiedad 'data' a la variable
          console.log('Videos:', response);

        } else {
          console.error('Error al cargar los videos:', response);
        }
      },
      error: (error) => {
        console.error('Error en la petición de videos:', error);
      }
    });
  }

  openEditVideoModal(video: any): void {

    this.formVideo.patchValue({
      descripcion: video.Descripcion
    });
  }

  openVerVideoModal(video: any): void {


    this.selectedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://127.0.0.1:8000' + video.URL);


  }

  deleteVideo(idDocuemto:any){

    Swal.fire({
      title: "Estas seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#FF5733",
      cancelButtonText:"Cancelar",
      confirmButtonText: "Si, Eliminar!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.documentService.deleteDocument(idDocuemto).subscribe({
          next:(response) => {
            if (response.StatusCode === 200) {
              Swal.fire({
                icon: "success",
                title: response.ReasonPhrase,
                text: response.Message,
                footer: response.StatusCode
              }).then(() => {
                this.loadVideoUsuario();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: response.ReasonPhrase,
                text: response.Message,
                draggable: true,
                footer: response.StatusCode
              });

            }
          },
          error:(error) => {
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
          complete:()=>{}
        });

      }
    });
  }

  editVideo(idDocuemto:any): void {

    if (this.formVideo.valid && this.selectedFileVideo) {


      const formData = new FormData();

      formData.append('_method', 'PUT');
      formData.append('Descripcion', this.formVideo.get('descripcion')?.value);
      if (this.selectedFileVideo) {
        formData.append('Archivo', this.selectedFileVideo);
      }
      this.documentService.updateDocument(idDocuemto,formData).subscribe({
        next:(response) => {
          if (response.StatusCode === 200) {
            Swal.fire({
              icon: "success",
              title: response.ReasonPhrase,
              text: response.Message,
              footer: response.StatusCode
            }).then(() => {

              this.resetFormVideo();
              this.loadVideoUsuario();
            });
          } else {
            Swal.fire({
              icon: "error",
              title: response.ReasonPhrase,
              text: response.Message,
              draggable: true,
              footer: response.StatusCode
            });

          }
        },
        error:(error) => {
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
        complete:()=>{}
      });
    }
  }

  playVideo(video: any): void {
    this.isPlaying[video.IDDocumento] = true;
  }

  pauseVideo(video: any): void {
    this.isPlaying[video.IDDocumento] = false;
  }

  //   loadVideos(): void {
  //   this.videos.forEach(video => {
  //     this.isPlaying[video.IDDocumento] = false; // Inicializa el estado de reproducción en falso
  //   });
  // }



  //PUBLICACIONES
  addPost(){

    this.isButtonDisabled = true;
    const formData = new FormData();

    // Agregar campos
    formData.append('TipoArchivo',this.typeArchivo);
    formData.append('Contenido', this.formPost.get('contenido')?.value);

    // Agregar archivo
    if (this.selectedFileArchivo) {
      formData.append('Archivo', this.selectedFileArchivo);
    }

    this.postService.addPost(formData).subscribe({
            next:(response) => {
              if (response.StatusCode === 201) {
                Swal.fire({
                  icon: "success",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  footer: response.StatusCode
                }).then(() => {
                  this.isButtonDisabled = false;
                  this.loadPostUsuario();
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
            complete:()=>{
              this.isButtonDisabled = false;
              this.resetFormPost();
            }
    });
  }

  resetFormPost() {
    this.formPost.get('contenido')?.setValue('');
    this.formPost.get('contenido')?.markAsUntouched();
    this.formPost.get('contenido')?.markAsPristine();

    this.formPost.get('archivo')?.setValue('');
    this.formPost.get('archivo')?.markAsUntouched();
    this.formPost.get('archivo')?.markAsPristine();

    this.imagePreviewPost = "";
    this.imagePreviewArchivo = "";
  }

  loadPostUsuario(): void {
    this.postService.getPostsUsuario().subscribe({
      next: (response) => {
        if (response.StatusCode === 200) {
          this.posts = response.Data; // Asignamos la propiedad 'data' a la variable
          console.log('Publicaciones:', response);

        } else {
          console.error('Error al cargar publicaciones:', response);
        }
      },
      error: (error) => {
        console.error('Error en la petición de publicaciones:', error);
      }
    });
  }

  deletePost(publicacion:any){

    Swal.fire({
      title: "Estas seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#FF5733",
      cancelButtonText:"Cancelar",
      confirmButtonText: "Si, Eliminar!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.postService.deletePost(publicacion.IDPublicacion).subscribe({
          next:(response) => {
            if (response.StatusCode === 200) {
              Swal.fire({
                icon: "success",
                title: response.ReasonPhrase,
                text: response.Message,
                footer: response.StatusCode
              }).then(() => {
                this.loadPostUsuario();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: response.ReasonPhrase,
                text: response.Message,
                draggable: true,
                footer: response.StatusCode
              });

            }
          },
          error:(error) => {
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
          complete:()=>{}
        });

      }
    });
  }

  openEditPostModal(publicacion: any): void {

    this.formPost.patchValue({
      contenido: publicacion.Contenido
    });
  }

  editPost(idPublicacion:any): void {

    if (this.formPost.valid && this.selectedFileArchivo) {


      const formData = new FormData();

      formData.append('_method', 'PUT');
      formData.append('Contenido', this.formPost.get('contenido')?.value);
      if (this.selectedFileArchivo) {
        formData.append('Archivo', this.selectedFileArchivo);
      }
      this.postService.updatePost(idPublicacion,formData).subscribe({
        next:(response) => {
          if (response.StatusCode === 200) {
            Swal.fire({
              icon: "success",
              title: response.ReasonPhrase,
              text: response.Message,
              footer: response.StatusCode
            }).then(() => {

              this.resetFormPost();
              this.loadPostUsuario();
            });
          } else {
            Swal.fire({
              icon: "error",
              title: response.ReasonPhrase,
              text: response.Message,
              draggable: true,
              footer: response.StatusCode
            });

          }
        },
        error:(error) => {
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
        complete:()=>{}
      });
    }
  }


  onFileSelectedArchivo(event: Event, tipo: string){

    const input = event.target as HTMLInputElement;

    this.typeArchivo = tipo;

    if (input.files && input.files[0]) {
      this.selectedFileArchivo = input.files[0];
      if(tipo == 'Foto'){
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewArchivo = reader.result;
        };
        reader.readAsDataURL(this.selectedFileArchivo);
      }
      else if(tipo == 'Video'){
        this.imagePreviewArchivo = "assets/videoDefault.png";
      }
      else if(tipo == 'PDF'){
         this.imagePreviewArchivo = "assets/pdfDefault.png";
      }
      }
    else {
      this.selectedFileArchivo = null; // Limpia la selección si el usuario cancela
    }
  }

  //COMENTARIOS
  addComment(idPublicacion:string){

    this.isButtonDisabled = true;
    const formData = new FormData();

    // Agregar campos
    formData.append('IDPublicacion', idPublicacion);
    formData.append('Contenido', this.formComentario.get('contenido')?.value);

    this.commentService.addComentario(idPublicacion,formData).subscribe({
            next:(response) => {
              if (response.StatusCode === 201) {
                Swal.fire({
                  icon: "success",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  footer: response.StatusCode
                }).then(() => {
                  this.isButtonDisabled = false;
                  this.loadPostUsuario();
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
            complete:()=>{
              this.isButtonDisabled = false;
              this.resetFormComment();
            }
    });
  }

  resetFormComment() {
    this.formComentario.get('contenido')?.setValue('');
    this.formComentario.get('contenido')?.markAsUntouched();
    this.formComentario.get('contenido')?.markAsPristine();


  }

  deleteComment(comment:any){

    Swal.fire({
      title: "Estas seguro?",
      text: "No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#FF5733",
      cancelButtonText:"Cancelar",
      confirmButtonText: "Si, Eliminar!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.commentService.deleteComment(comment.IDComentario).subscribe({
          next:(response) => {
            if (response.StatusCode === 200) {
              Swal.fire({
                icon: "success",
                title: response.ReasonPhrase,
                text: response.Message,
                footer: response.StatusCode
              }).then(() => {
                this.loadPostUsuario();
              });
            } else {
              Swal.fire({
                icon: "error",
                title: response.ReasonPhrase,
                text: response.Message,
                draggable: true,
                footer: response.StatusCode
              });

            }
          },
          error:(error) => {
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
          complete:()=>{}
        });

      }
    });
  }

  openEditCommentModal(comentario: any): void {

    this.selectedComentario = comentario;

    this.formComentario.patchValue({
      contenido: comentario.Contenido
    });

    // Abre el modal usando JavaScript de Bootstrap
    const modalElement = document.getElementById('editComentarioModal'); // Usa el ID fijo
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  updateCommet(): void {

    if (this.formComentario.valid && this.selectedComentario) {


      const formData = new FormData();

      formData.append('_method', 'PUT');
      formData.append('Contenido', this.formComentario.get('contenido')?.value);

      this.commentService.updateComment(this.selectedComentario.IDComentario,formData).subscribe({
        next:(response) => {
          if (response.StatusCode === 200) {
            Swal.fire({
              icon: "success",
              title: response.ReasonPhrase,
              text: response.Message,
              footer: response.StatusCode
            }).then(() => {

              const modalElement = document.getElementById('editComentarioModal');
              if (modalElement) {
                const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
                modal?.hide();
              }
              this.resetFormComment();
              this.loadPostUsuario();
            });
          } else {
            Swal.fire({
              icon: "error",
              title: response.ReasonPhrase,
              text: response.Message,
              draggable: true,
              footer: response.StatusCode
            });

          }
        },
        error:(error) => {
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
        complete:()=>{
          const modalElement = document.getElementById('editComentarioModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
        }
      });
    }
  }

  //LIKED
  toggleLike(publicacion:any){

            const publicacionId = publicacion.IDPublicacion;

        if (publicacion.likedByCurrentUser) {

          this.postService.unlikePost(publicacionId).subscribe({
            next:(response) => {
              if (response.StatusCode === 200) {
                Swal.fire({
                  icon: "success",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  footer: response.StatusCode
                }).then(() => {
                  this.loadPostUsuario();
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  draggable: true,
                  footer: response.StatusCode
                });

              }
            },
            error:(error) => {
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
            complete:()=>{}
          });

        }else{
          this.postService.likePost(publicacionId).subscribe({
            next:(response) => {
              if (response.StatusCode === 200) {
                Swal.fire({
                  icon: "success",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  footer: response.StatusCode
                }).then(() => {
                  this.loadPostUsuario();
                });
              } else {
                Swal.fire({
                  icon: "error",
                  title: response.ReasonPhrase,
                  text: response.Message,
                  draggable: true,
                  footer: response.StatusCode
                });

              }
            },
            error:(error) => {
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
            complete:()=>{}
          });
        }

  }

}
