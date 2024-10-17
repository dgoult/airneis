import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm = this.fb.group({
    full_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  })

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) { }

  get full_name() {
    return this.registerForm.controls['full_name'];
  }

  get email() {
    return this.registerForm.controls['email'];
  }

  get password() {
    return this.registerForm.controls['password'];
  }

  submitDetails() {
    const { full_name, email, password } = this.registerForm.value;

    if(!full_name || !email || !password){
      return;
    }

    this.authService.registerUser({ full_name, email, password }).subscribe(
      response => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: response.toString() });
        this.router.navigate(['login'])
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong' });
      }
    )
  }

}
