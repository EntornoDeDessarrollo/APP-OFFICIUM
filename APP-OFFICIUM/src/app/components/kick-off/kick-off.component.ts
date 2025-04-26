import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { faNewspaper } from '@fortawesome/free-solid-svg-icons';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { faShare } from '@fortawesome/free-solid-svg-icons';
import { faFaceLaugh } from '@fortawesome/free-solid-svg-icons';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import { MainNavComponent } from '../sections/main-nav/main-nav.component';
import { DesempleadoProfile, EmpresaProfile, Profile } from '../../interface/auth/auth';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-kick-off',
  imports: [FontAwesomeModule, MainNavComponent],
  templateUrl: './kick-off.component.html',
  styleUrl: './kick-off.component.css'
})
export class KickOffComponent implements OnInit, OnDestroy {
  faPeopleGroup = faPeopleGroup;
  faNewspaper = faNewspaper;
  faCalculator = faCalculator;

  faPlus = faPlus;
  faVideo = faVideo;
  faFile = faFile;
  faImage = faImage;
  faThumbsUp = faThumbsUp;
  faComment = faComment;
  faShare = faShare;
  faFaceLaugh = faFaceLaugh;
  faFileImage = faFileImage;

  profile?: Profile;
  isEmpresa?: boolean = false;
  isDesempleado?: boolean = false;
  private profileSubscription?: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.profileSubscription = this.authService.profile$.subscribe(profile => {
      this.profile = profile;
      this.isEmpresa = profile! && (profile as EmpresaProfile).NombreEmpresa !== undefined;
      this.isDesempleado = profile! && (profile as DesempleadoProfile).Nombre !== undefined;
      console.log('Perfil en KickOffComponent:', this.profile);
    });
  }

  ngOnDestroy(): void {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }



  getFotoPerfil(): string {
    if (this.isEmpresa && (this.profile as EmpresaProfile).Foto) {
      return `http://127.0.0.1:8000/${(this.profile as EmpresaProfile).Foto}`; // Ajusta la URL base de tu API
    }
    else if (this.isDesempleado && (this.profile as DesempleadoProfile).Foto) {
      return `http://127.0.0.1:8000/${(this.profile as DesempleadoProfile).Foto}`; // Ajusta la URL base de tu API
    }

    // Puedes tener una imagen por defecto para desempleados si lo deseas
    return 'URL_IMAGEN_POR_DEFECTO';
  }

  getNombre(): string {
    if (this.isEmpresa) {
      return (this.profile as EmpresaProfile).NombreEmpresa;
    } else if (this.isDesempleado) {
      return (this.profile as DesempleadoProfile).Nombre;
    }
    return 'Nombre de Usuario'; // Valor por defecto
  }

  getSubtitulo(): string {
    if (this.isEmpresa) {
      // Puedes obtener el nombre del sector basado en el ID
      return `Sector: ${(this.profile as EmpresaProfile).IDSector}`;
    } else if (this.isDesempleado) {
      return 'Desempleado'; // O podrías tener su profesión
    }
    return '';
  }

  getUbicacion(): string {
    if (this.isEmpresa) {
      return (this.profile as EmpresaProfile).Ubicacion;
    } else if (this.isDesempleado) {
      // Podrías tener la ubicación del desempleado en su perfil
      return 'Ubicación no disponible';
    }
    return '';
  }


}
