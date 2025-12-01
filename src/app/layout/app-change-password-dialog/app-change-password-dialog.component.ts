import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UserService } from '../../services/user.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './app-change-password-dialog.component.html',
  styleUrls: ['./app-change-password-dialog.component.scss']
})
export class AppChangePasswordDialogComponent implements OnInit {
  changePasswordForm!: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: [''],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    if (!this.config.data?.fromAdmin) {
      this.changePasswordForm.get('currentPassword')?.setValidators([Validators.required]);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;
    return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submitted = true;

    if (this.changePasswordForm.invalid) {
      return;
    }

    const { currentPassword, newPassword, confirmNewPassword } = this.changePasswordForm.value;

    // The user ID should come from the authenticated user context
    // For now, we'll assume it's passed via config or we'll get it from localStorage
    const userId = this.config.data?.userId || localStorage.getItem('userId');

    if (!userId) {
      this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: 'User information not found' });
      return;
    }

    this.userService.changePassword(userId, currentPassword, newPassword, confirmNewPassword).subscribe({
      next: (response) => {
        this.submitted = false;
        this.messageService.add({ key: 'tst', severity: 'success', summary: 'Success', detail: 'Password changed successfully' });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.submitted = false;
        console.error('Change password error:', error);
        let errorMessage = 'An error occurred while changing password';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Current password is incorrect';
        } else if (error.status === 400) {
          errorMessage = Array.isArray(error.error)
            ? error.error[0]?.description ?? errorMessage
            : typeof error.error.error === 'string'
              ? error.error.error
              : errorMessage;
        }
        this.messageService.add({ key: 'tst', severity: 'error', summary: 'Error', detail: errorMessage });
      }
    });
  }
}
