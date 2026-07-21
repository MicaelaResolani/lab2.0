import { Component } from '@angular/core';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  onLogin() {
    console.log('Login intentado');
    // Aquí iría la lógica de login más adelante
  }
}
