import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { InventoryService } from '../../services/inventory.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
declare var bootstrap: any;

interface Movement {
  fecha: string;
  tipo: string;
  cantidad: number;
  producto: string;
  um: string;
}

@Component({
  selector: 'app-movement-report',
  templateUrl: './movement-report.component.html'
})
export class MovementReportComponent implements OnInit {
  dateForm: FormGroup;
  currentPDF: any = null;
  minDate: string;
  maxDate: string;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService
  ) {
    // Establecer fecha mínima como 1 de enero de 2025
    this.minDate = '2025-01-01';
    
    // Establecer fecha máxima como día actual
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];

    this.dateForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Escuchar cambios en la fecha de inicio
    this.dateForm.get('startDate')?.valueChanges.subscribe(startDate => {
      const endDateControl = this.dateForm.get('endDate');
      if (startDate && endDateControl?.value) {
        if (new Date(endDateControl.value) < new Date(startDate)) {
          endDateControl.setValue(startDate);
        }
      }
    });

    // Escuchar cambios en la fecha fin
    this.dateForm.get('endDate')?.valueChanges.subscribe(endDate => {
      const startDateControl = this.dateForm.get('startDate');
      if (endDate && startDateControl?.value) {
        if (new Date(startDateControl.value) > new Date(endDate)) {
          startDateControl.setValue(endDate);
        }
      }
    });
  }

  previewReport(): void {
    if (this.dateForm.valid) {
      const { startDate, endDate } = this.dateForm.value;
      
      this.inventoryService.getMovementsByDateRange(startDate, endDate)
        .subscribe({
          next: (movements: Movement[]) => {
            this.generatePDF(movements, startDate, endDate, true);
          },
          error: (error) => console.error('Error getting movements:', error)
        });
    }
  }

  generateReport(): void {
    if (this.currentPDF) {
      this.currentPDF.save(`reporte_movimientos_${this.dateForm.value.startDate}_${this.dateForm.value.endDate}.pdf`);
    } else {
      if (this.dateForm.valid) {
        const { startDate, endDate } = this.dateForm.value;
        this.inventoryService.getMovementsByDateRange(startDate, endDate)
          .subscribe({
            next: (movements: Movement[]) => {
              this.generatePDF(movements, startDate, endDate, false);
            },
            error: (error) => console.error('Error getting movements:', error)
          });
      }
    }
  }

  private generatePDF(movements: Movement[], startDate: string, endDate: string, preview: boolean = false): void {
    const doc = new jsPDF();

    // Configurar el documento
    doc.setFontSize(18);
    doc.setTextColor('#FF5722');
    doc.setFont('helvetica', 'bold');
    doc.text('BAMX ', 14, 20);
    doc.text('', 14, 30);

    doc.setFontSize(14);
    doc.setTextColor('#333');
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporte de Movimientos del ${new Date(startDate).toLocaleDateString()} al ${new Date(endDate).toLocaleDateString()}`, 14, 40);

    // Agrupar movimientos por producto
    const groupedMovements = movements.reduce((acc: { [key: string]: Movement[] }, mov: Movement) => {
      if (!acc[mov.producto]) {
        acc[mov.producto] = [];
      }
      acc[mov.producto].push(mov);
      return acc;
    }, {});

    let yPosition = 50;

    Object.keys(groupedMovements).forEach(producto => {
      const movs: Movement[] = groupedMovements[producto];

      // Encabezado del producto
      doc.setFontSize(14);
      doc.setTextColor('#FF5722');
      doc.setFont('helvetica', 'bold');
      doc.text(`Producto: ${producto}`, 14, yPosition);
      yPosition += 10;

      const tableData = movs.map((mov: Movement) => [
        new Date(mov.fecha).toLocaleDateString(),
        mov.tipo.toUpperCase(),
        `${mov.cantidad} ${mov.um}`,
        mov.tipo === 'entrada' ? 'Ingreso' : 'Salida'
      ]);

      // @ts-ignore
      doc.autoTable({
        startY: yPosition,
        head: [['Fecha', 'Tipo', 'Cantidad', 'Movimiento']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: '#FF5722', textColor: '#FFFFFF' },
        alternateRowStyles: { fillColor: '#F5F5F5' },
        styles: { fontSize: 10 }
      });

      // @ts-ignore
      yPosition = doc.autoTable.previous.finalY + 15;

      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });

    if (preview) {
      const modal = new bootstrap.Modal(document.getElementById('pdfPreviewModal'));
      const previewDiv = document.getElementById('pdfPreview');
      if (previewDiv) {
        const pdfData = doc.output('datauristring');
        previewDiv.innerHTML = `<embed src="${pdfData}" width="100%" height="100%" type="application/pdf">`;
      }
      this.currentPDF = doc;
      modal.show();

      const downloadBtn = document.getElementById('downloadPdfBtn');
      if (downloadBtn) {
        downloadBtn.onclick = () => this.generateReport();
      }
    } else {
      doc.save(`reporte_movimientos_${startDate}_${endDate}.pdf`);
    }
  }
}