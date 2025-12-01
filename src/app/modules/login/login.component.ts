import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { LayoutService } from '../../layout/app.layout.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  valCheck: string[] = ['remember'];

  password!: string;

  loginForm: FormGroup;

  msgs: Message[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public layoutService: LayoutService,
    private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.msgs = [];
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (response) => {
          if (response && response.token) {
            localStorage.setItem('access_token', response.token);
            this.router.navigate(['/app/dashboard']).then();
          } else {
            console.error('Login response does not contain token:', response);
            this.msgs = [];
            this.msgs.push({ severity: 'error', summary: 'Login failed', detail: 'Invalid response from server.' });
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.msgs = [];
          if (error.status == 401) {
            this.msgs.push({ severity: 'error', summary: 'Login failed', detail: 'Invalid Credentials.' });
          }
          else
            this.msgs.push({ severity: 'error', summary: 'Login failed', detail: 'Invalid response from server.' });
        }
      });
    }
  }
}
