// movement-report.component.ts
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Definir interfaces para los tipos
interface Movement {
  fecha: string;
  tipo: string;
  cantidad: number;
  producto: string;
}

@Component({
  selector: 'app-movement-report',
  templateUrl: './movement-report.component.html'
})
export class MovementReportComponent {
  dateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService
  ) {
    this.dateForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  generateReport(): void {
    if (this.dateForm.valid) {
      const { startDate, endDate } = this.dateForm.value;
      
      this.inventoryService.getMovementsByDateRange(startDate, endDate)
        .subscribe({
          next: (movements: Movement[]) => {
            this.generatePDF(movements, startDate, endDate);
          },
          error: (error) => console.error('Error getting movements:', error)
        });
    }
  }

  private generatePDF(movements: Movement[], startDate: string, endDate: string): void {
    const doc = new jsPDF();
    const title = `Reporte de Movimientos`;
    const subtitle = `Del ${new Date(startDate).toLocaleDateString()} al ${new Date(endDate).toLocaleDateString()}`;

    // Agrupar movimientos por producto
    const groupedMovements = movements.reduce((acc: { [key: string]: Movement[] }, mov: Movement) => {
      if (!acc[mov.producto]) {
        acc[mov.producto] = [];
      }
      acc[mov.producto].push(mov);
      return acc;
    }, {});

    // Configurar el documento
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 30);

    // Para cada producto
    let yPosition = 40;

    Object.keys(groupedMovements).forEach(producto => {
      const movs: Movement[] = groupedMovements[producto];

      // Encabezado del producto
      doc.setFontSize(14);
      doc.text(`Producto: ${producto}`, 14, yPosition);
      yPosition += 10;

      // Tabla de movimientos
      const tableData = movs.map((mov: Movement) => [
        new Date(mov.fecha).toLocaleDateString(),
        mov.tipo.toUpperCase(),
        mov.cantidad.toString(),
        mov.tipo === 'entrada' ? 'Ingreso' : 'Salida'
      ]);

      // @ts-ignore
      doc.autoTable({
        startY: yPosition,
        head: [['Fecha', 'Tipo', 'Cantidad', 'Movimiento']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] }
      });

      // @ts-ignore
      yPosition = doc.autoTable.previous.finalY + 15;

      // Nueva página si es necesario
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });

    // Guardar el PDF
    doc.save(`reporte_movimientos_${startDate}_${endDate}.pdf`);
  }
}