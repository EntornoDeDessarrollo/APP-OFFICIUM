import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/sections/footer/footer.component';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FooterComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'APP-OFFICIUM';
}
