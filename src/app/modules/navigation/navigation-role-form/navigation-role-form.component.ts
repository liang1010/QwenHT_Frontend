import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NavigationService } from '../../../services/navigation.service';
import { NavigationItem } from '../../../models/navigation-item.model';

@Component({
  selector: 'app-navigation-role-form',
  templateUrl: './navigation-role-form.component.html',
  // styleUrls: ['./navigation-role-form.component.scss']
})
export class NavigationRoleFormComponent implements OnInit {
  roleForm: FormGroup;
  navigationItem: NavigationItem | null = null;
  availableRoles: string[] = [];

  constructor(
    private fb: FormBuilder,
    private navigationService: NavigationService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.roleForm = this.fb.group({
      roles: [[]] // Multi-select for roles (no required validator for now)
    });
  }

  ngOnInit(): void {
    if (this.config.data && this.config.data.item) {
      this.navigationItem = this.config.data.item;
      this.availableRoles = this.config.data.availableRoles;
      // Set the current roles directly from the passed item
      this.setCurrentRolesFromItem();
    }
  }

  setCurrentRolesFromItem(): void {
    if (this.navigationItem && this.navigationItem.roleNavigations) {
      const currentRoles = this.navigationItem.roleNavigations.map(rn => rn.roleName);
      this.roleForm.patchValue({ roles: currentRoles });
    }
  }

  onSubmit(): void {
    if (!this.navigationItem) {
      return;
    }

    const selectedRoles: string[] = this.roleForm.get('roles')?.value || [];

    // Get current roles from the item passed via dialog data
    const currentRoles = this.navigationItem.roleNavigations?.map(rn => rn.roleName) || [];

    // Find roles to remove (in current but not in selected)
    const rolesToRemove = currentRoles.filter(role => !selectedRoles.includes(role));

    // Find roles to add (in selected but not in current)
    const rolesToAdd = selectedRoles.filter(role => !currentRoles.includes(role));

    // Create observables for all operations
    const operations = [];

    // Remove roles that are no longer selected
    for (const role of rolesToRemove) {
      operations.push(this.navigationService.removeRoleFromNavigation(this.navigationItem!.id, role));
    }

    // Add new roles
    for (const role of rolesToAdd) {
      operations.push(this.navigationService.assignRoleToNavigation(this.navigationItem!.id, role));
    }

    // Execute all operations
    if (operations.length > 0) {
      // Execute operations sequentially
      this.executeOperationsSequentially(operations).then(() => {
        this.ref.close(true);
      }).catch(error => {
        console.error('Error assigning/removing roles:', error);
      });
    } else {
      // No changes to make
      this.ref.close(true);
    }
  }

  private executeOperationsSequentially(operations: any[]): Promise<void> {
    return operations.reduce((promise, operation) => {
      return promise.then(() => operation.toPromise());
    }, Promise.resolve()) as any;
  }

  onCancel(): void {
    this.ref.close();
  }
}
