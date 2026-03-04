// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-reject-reason',
//   standalone: true,
//   imports: [],
//   templateUrl: './reject-reason.component.html',
//   styleUrl: './reject-reason.component.scss'
// })
// export class RejectReasonComponent {

// }
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';

interface DefectItem {
  name: string;
  count: number;
  isFlipped: boolean;
}

@Component({
  selector: 'app-reject-reason',
  standalone: true,
  imports: [DialogModule, CommonModule, ButtonModule, FormsModule],
  templateUrl: './reject-reason.component.html',
  styleUrl: './reject-reason.component.scss'
})


export class RejectReasonComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  mainModalVisible: boolean = false;
  isFullScreen: boolean = false;
  isMaximized: boolean = false;
items: DefectItem[] = [
  { name: 'Back Front High Low', count: 0, isFlipped: false },
  { name: 'Broken Stitch', count: 0, isFlipped: false },
  { name: 'Color Bleed', count: 0, isFlipped: false },
  { name: 'Defect Button', count: 0, isFlipped: false },
  { name: 'Dirty Spot', count: 0, isFlipped: false },
  { name: 'Distorted Shape', count: 0, isFlipped: false },
  { name: 'Down Stitch', count: 0, isFlipped: false },
  { name: 'Dyeing Spot', count: 0, isFlipped: false },

  { name: 'Embroidery Defect', count: 0, isFlipped: false },
  { name: 'Fabric Defect', count: 0, isFlipped: false },
  { name: 'Fabric Hole', count: 0, isFlipped: false },
  { name: 'Insecure Stitch', count: 0, isFlipped: false },
  { name: 'Iron Problem', count: 0, isFlipped: false },
  { name: 'Join Stitch', count: 0, isFlipped: false },
  { name: 'Knot', count: 0, isFlipped: false },
  { name: 'Label Missing', count: 0, isFlipped: false },

  { name: 'Label Mistake', count: 0, isFlipped: false },
  { name: 'Lycra Missing', count: 0, isFlipped: false },
  { name: 'Needle Cut', count: 0, isFlipped: false },
  { name: 'Needle Cut Irreparable', count: 0, isFlipped: false },
  { name: 'Needle Mark', count: 0, isFlipped: false },
  { name: 'Oil Spot', count: 0, isFlipped: false },
  { name: 'Open Seam', count: 0, isFlipped: false },
  { name: 'Over Stitch', count: 0, isFlipped: false },

  { name: 'Pleat', count: 0, isFlipped: false },
  { name: 'Point Up-Down', count: 0, isFlipped: false },
  { name: 'Print Defect', count: 0, isFlipped: false },
  { name: 'Print/Emb. Irreparable Problem', count: 0, isFlipped: false },
  { name: 'Process Missing', count: 0, isFlipped: false },
  { name: 'Puckering', count: 0, isFlipped: false },
  { name: 'Raw Edge', count: 0, isFlipped: false },
  { name: 'Reverse', count: 0, isFlipped: false },

  { name: 'Scissor Cut', count: 0, isFlipped: false },
  { name: 'Shading', count: 0, isFlipped: false },
  { name: 'Shoulder Forward', count: 0, isFlipped: false },
  { name: 'Skip Stitch', count: 0, isFlipped: false },
  { name: 'Slanted', count: 0, isFlipped: false },
  { name: 'Slub', count: 0, isFlipped: false },
  { name: 'Tension Bad', count: 0, isFlipped: false },
  { name: 'Twisting', count: 0, isFlipped: false },

  { name: 'Uncut Thread', count: 0, isFlipped: false },
  { name: 'Uneven Stitch', count: 0, isFlipped: false },
  { name: 'Wash Fail', count: 0, isFlipped: false },
  { name: 'Wavy', count: 0, isFlipped: false },
  { name: 'Width Uneven', count: 0, isFlipped: false },
  { name: 'Wrong SPI', count: 0, isFlipped: false }
];
  openMainOperation() {
    this.visible = false;
    this.mainModalVisible = true;
  }

  handleMaximize() {
    this.isMaximized = !this.isMaximized;
   // this.isFullScreen = false; 
  }
increase(item: DefectItem) {
  const previous = item.count;
  item.count++;

  // 0 → 1 হলে flip
  if (previous === 0 && item.count === 1) {
    item.isFlipped = true;
  }
}

decrease(item: DefectItem) {
  if (item.count === 0) return;

  const previous = item.count;
  item.count--;

  // 1 → 0 হলে flip back
  if (previous === 1 && item.count === 0) {
    item.isFlipped = false;
  }
}
getRows(arr: any[], chunkSize: number) {
  const rows: any[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    rows.push(arr.slice(i, i + chunkSize));
  }
  return rows;
}

}
