import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-size-quantity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './size-quantity.component.html',
  styleUrl: './size-quantity.component.scss'
})
export class SizeQuantityComponent {
  totalSizeQty: number = 0;

  @Input() visible: boolean = false;
  @Input() sizeList: any[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<void>();
  @Output() totalCal = new EventEmitter<number>();

  ngOnInit(): void {
    this.calculateTotal();
  }

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onConfirm() {
    this.totalCal.emit();
    this.confirm.emit();
 
  }
  calculateTotal() {
    this.totalSizeQty = this.sizeList.reduce((s, x) => s + (+x.qty || 0), 0);
  }
}
