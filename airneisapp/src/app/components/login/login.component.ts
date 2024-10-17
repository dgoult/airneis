import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  })

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private msgService: MessageService
  ) { }

  get email() {
    return this.loginForm.controls['email'];
  }
  get password() { return this.loginForm.controls['password']; }

  loginUser() {
    const { email, password } = this.loginForm.value;
    if(!email || !password) {
      return;
    } 

    this.authService.loginUser({ email, password }).subscribe(
      response => {
        if (response.token) {
          const isAdmin: boolean = (response.user.role === 'admin') ?? false;
          const expirationTime = new Date().getTime() + 3600 * 1000;

          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('user_id', response.user.user_id.toString());
          sessionStorage.setItem('isAdmin', isAdmin.toString() );
          sessionStorage.setItem('tokenExpiration', expirationTime.toString());

          isAdmin
          ? this.router.navigate(['/home-admin'])
          : this.router.navigate(['/home']);
        } else {
          this.msgService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
      },
      error => {
        this.msgService.add({ severity: 'error', summary: 'Error', detail: `Something went wrong : ${error.error.message}`, life: 3000 });
      }

    )
  }
}
