import { Routes } from '@angular/router';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { VerifyCodeComponent } from './components/auth/verify-code/verify-code.component';
import { NewProfileComponent } from './components/auth/new-profile/new-profile.component';
import { RecoverComponent } from './components/auth/recover/recover.component';
import { KickOffComponent } from './components/kick-off/kick-off.component';
import { authGuard } from './guards/auth/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [

  { path:'home', component:HomeComponent },
  // // Ruta por defecto (vacía) -> Redirigir a /eventos
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // // Ruta que no coincide con ninguna de las anteriores
  // { path: '**', redirectTo: 'home', pathMatch: 'full' },


  { path:'login', component:LoginComponent },
  { path:'recover', component: RecoverComponent },
  { path:'register', component:RegisterComponent, title:'Registro'},
  { path:'verify/:email', component:VerifyCodeComponent, title:'Verificación', canActivate: [authGuard] },
  { path:'newProfile', component: NewProfileComponent, title:'Nuevo Perfil', canActivate: [authGuard] },
  { path:'profile', component: ProfileComponent, title:'Perfil', canActivate: [authGuard] },





  { path:'kick-off', component: KickOffComponent, title:'Inicio', canActivate: [authGuard] },


];
