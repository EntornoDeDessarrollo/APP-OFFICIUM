import { Component } from '@angular/core';
import { MainNavComponent } from "../sections/main-nav/main-nav.component";
import { RegisterComponent } from "../auth/register/register.component";
import { NewProfileComponent } from '../auth/new-profile/new-profile.component';

@Component({
  selector: 'app-profile',
  imports: [MainNavComponent, NewProfileComponent ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

}
