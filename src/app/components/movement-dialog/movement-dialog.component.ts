import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
declare var bootstrap: any;

@Component({
  selector: 'app-movement-dialog',
  templateUrl: './movement-dialog.component.html',
  styleUrls: ['./movement-dialog.component.css']
})
export class MovementDialogComponent implements OnInit {
  @Input() product: any;
  movementForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService
  ) {
    this.movementForm = this.fb.group({
      tipo: ['entrada', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    // Inicialización si es necesaria
  }

  onSubmit() {
    if (this.movementForm.valid && this.product) {
      const movement = {
        ...this.movementForm.value,
        producto: this.product.productos,
        peso: this.product.peso,
        um: this.product.um
      };

      this.inventoryService.addMovement(movement).subscribe({
        next: () => {
          const modal = bootstrap.Modal.getInstance(document.getElementById('movementModal'));
          modal.hide();
          this.movementForm.reset({tipo: 'entrada'});
          window.location.reload();
        },
        error: (error) => console.error('Error registering movement:', error)
      });
    }
  }
}