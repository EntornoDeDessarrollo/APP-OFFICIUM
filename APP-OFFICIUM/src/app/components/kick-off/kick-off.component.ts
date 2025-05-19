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
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // Importa CommonModule


@Component({
  selector: 'app-kick-off',
  imports: [FontAwesomeModule, MainNavComponent,CommonModule],
  templateUrl: './kick-off.component.html',
  styleUrl: './kick-off.component.css'
})
export class KickOffComponent implements OnInit {

  ngOnInit(): void {
    this.profile$.subscribe(profile => {
      console.log('Perfil en KickOff al inicio:', profile);
    });
  }
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

  profile$!: Observable<Profile | null>; // Usamos la aserción de inicialización definida (!)
  isEmpresa$!: Observable<boolean>;
  isDesempleado$!: Observable<boolean>;
  fotoPerfil$!: Observable<string|null>;
  nombre$!: Observable<string>;
  subtitulo$!: Observable<string>;
  ubicacion$!: Observable<string>;

  constructor(private authService: AuthService) {
    //this.authService.loadProfile();
    this.profile$ = this.authService.profile$;
    this.isEmpresa$ = this.authService.isEmpresa$;
    this.isDesempleado$ = this.authService.isDesempleado$;
    this.fotoPerfil$ = this.authService.getFotoPerfil$();
    this.nombre$ = this.authService.getNombre$();
    this.subtitulo$ = this.authService.getSubtitulo$();
    this.ubicacion$ = this.authService.getUbicacion$();
  }

}
