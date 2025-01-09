import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
declare var bootstrap: any;

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  styleUrls: ['./inventory-table.component.css']
})
export class InventoryTableComponent implements OnInit {
  inventory: any[] = [];
  filteredInventory: any[] = [];
  selectedProduct: any = null;
  
  constructor(private inventoryService: InventoryService) { }

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.inventoryService.getProducts().subscribe({
      next: (data) => {
        this.inventory = data;
        this.filteredInventory = data;
      },
      error: (error) => console.error('Error loading inventory:', error)
    });
  }

  openAddModal() {
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
  }

  openMovementModal(product: any) {
    this.selectedProduct = product;
    const modal = new bootstrap.Modal(document.getElementById('movementModal'));
    modal.show();
  }

  applyFilter(event: any) {
    const filterValue = event.target.value.toLowerCase();
    this.filteredInventory = this.inventory.filter(item =>
      item.productos.toLowerCase().includes(filterValue) ||
      item.tipo.toLowerCase().includes(filterValue)
    );
  }

  exportToExcel() {
    this.inventoryService.exportToExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Inventario.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting to Excel:', error)
    });
  }
}