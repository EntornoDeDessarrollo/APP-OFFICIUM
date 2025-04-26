import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, NavigationEnd  } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, NgIf],
  standalone: true,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {
  isHomePage = false;
  isLoginPage = false;
  isRegisterPage = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkRoute();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkRoute();
    });
  }

  checkRoute() {
    const currentRoute = this.router.url;
    this.isHomePage = currentRoute === '/home';
    this.isLoginPage = currentRoute === '/login';
    this.isRegisterPage = currentRoute === '/register';
  }

}
