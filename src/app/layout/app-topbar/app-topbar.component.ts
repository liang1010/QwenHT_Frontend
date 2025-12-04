import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../app.layout.service';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthService } from '../../services/auth.service';
import { AppChangePasswordDialogComponent } from '../app-change-password-dialog/app-change-password-dialog.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './app-topbar.component.html',
  styleUrl: './app-topbar.component.scss'
})
export class AppTopBarComponent {

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: LayoutService,
        private dialogService: DialogService,
        private authService: AuthService
    ) { }

    onPasswordChangeClick() {
        // Close the profile menu when opening the dialog
        this.layoutService.state.profileSidebarVisible = false;

        // Get user ID from auth service
        const userId = this.authService.getUserName();

        const ref = this.dialogService.open(AppChangePasswordDialogComponent, {
            header: 'Change Password',
            width: '500px',

            contentStyle: { 'max-height': '500px','max-width': '500px', 'overflow': 'auto' },
            baseZIndex: 999,
            data: {
                userId: userId
            }
        });

        ref.onClose.subscribe((result: boolean) => {
            if (result) {
                // Handle successful password change
                console.log('Password changed successfully');
            }
        });
    }

    logout(){
      this.authService.logout();
    }
}
