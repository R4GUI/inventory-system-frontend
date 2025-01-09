import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Componentes
import { AppComponent } from './app.component';
import { InventoryTableComponent } from './components/inventory-table/inventory-table.component';
import { AddProductDialogComponent } from './components/add-product-dialog/add-product-dialog.component';
import { MovementDialogComponent } from './components/movement-dialog/movement-dialog.component';

// Servicios
import { InventoryService } from './services/inventory.service';
import { MovementReportComponent } from './components/movement-report/movement-report.component';

@NgModule({
  declarations: [
    AppComponent,
    InventoryTableComponent,
    AddProductDialogComponent,
    MovementDialogComponent,
    MovementReportComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    InventoryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }