// add-product-dialog.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
declare var bootstrap: any;

@Component({
  selector: 'app-add-product-dialog',
  templateUrl: './add-product-dialog.component.html',
  styleUrls: ['./add-product-dialog.component.css']
})
export class AddProductDialogComponent implements OnInit {
  productForm: FormGroup;
  
  // Opciones predefinidas
  unidadesMedida = ['KGS', 'LTS', 'PZA'];
  tipos = ['ABARROTE', 'NO COMESTIBLE', 'PAN', 'PERECEDERO'];

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService
  ) {
    this.productForm = this.fb.group({
      productos: ['', [Validators.required]],
      um: ['', Validators.required],
      peso: [null, [Validators.required, Validators.min(0)]],
      tipo: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(0)]],
      precio_unit: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Puedes inicializar valores aquí si es necesario
  }

  onSubmit() {
    if (this.productForm.valid) {
      // Convertir el nombre del producto a mayúsculas
      const formData = {
        ...this.productForm.value,
        productos: this.productForm.get('productos')?.value.toUpperCase()
      };

      this.inventoryService.addProduct(formData).subscribe({
        next: () => {
          const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
          modal.hide();
          this.productForm.reset();
          window.location.reload();
        },
        error: (error) => console.error('Error adding product:', error)
      });
    }
  }
}