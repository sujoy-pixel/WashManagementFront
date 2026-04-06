import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { WashSetupService } from 'src/app/components/mascowash/services/washsetup.service';
import { CommonServiceService } from 'src/app/components/mascowash/services/common-service';
import { ToastrService } from 'ngx-toastr';

let repairableColorIndex = 0;
let rejectColorIndex = 0;

interface DefectItem {
  defectId: number;
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
export class RejectReasonComponent implements OnInit {

  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() type: string = '';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmReject = new EventEmitter<any[]>();
  @Output() onConfirm = new EventEmitter<any>();

  items: DefectItem[] = [];
  dataList: any[] = [];

  mainModalVisible: boolean = false;
  isFullScreen: boolean = false;
  isMaximized: boolean = false;
  allSelectedDefects: any[] = [];
  groupedDefects: { [key: string]: any[] } = {};
  groupCounter = 1;


  constructor(
    private service: WashSetupService,
    public commonService: CommonServiceService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }


  // 🔹 Load Fault Name from API
  loadData() {
    debugger;
    this.service.getFaultNameList().subscribe({

      next: (res: any) => {
        this.dataList = res ?? [];
        this.items = this.dataList.map((x: any) => ({
          defectId: x.faultNameId || x.FaultNameId,
          name: x.faultName || x.FaultName,
          count: 0,
          isFlipped: false
        }));
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load Fault Name data');
      }
    });
  }

  // 🔹 Open dialog
  showDialog() {
    this.visible = true;
    this.visibleChange.emit(true);
  }

  // 🔹 Close dialog
  closeDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  openMainOperation() {
    this.visible = false;
    this.mainModalVisible = true;
  }

  handleMaximize() {
    this.isMaximized = !this.isMaximized;
  }

  // 🔹 Increase count
  increase(item: DefectItem) {
    const previous = item.count;
    item.count++;
    if (previous === 0 && item.count === 1) {
      item.isFlipped = true;
    }
  }

  // 🔹 Decrease count
  decrease(item: DefectItem) {
    if (item.count === 0) return;
    const previous = item.count;
    item.count--;
    if (previous === 1 && item.count === 0) {
      item.isFlipped = false;
    }
  }

  // 🔹 Create grid rows
  getRows(arr: any[], chunkSize: number) {
    const rows: any[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      rows.push(arr.slice(i, i + chunkSize));
    }
    return rows;
  }

  generateColorVariant(index: number, type: 'repairable' | 'reject'): string {
    const lightnessMap = [90, 80, 70, 60, 50];
    let lightness = lightnessMap[index - 1] ?? (88 - index * 8);
    if (type === 'repairable') {
      return `hsl(50, 100%, ${lightness}%)`; // yellow
    }
    if (type === 'reject') {
      return `hsl(10, 100%, ${lightness}%)`; // red
    }
    return `hsl(0, 0%, 90%)`;
  }

  confirmSelection() {
    const groupKey = this.groupCounter.toString().padStart(4, '0');
    let currentIndex = 0;

    if (this.type === 'repairable') {
      repairableColorIndex++;
      currentIndex = repairableColorIndex;
    } else if (this.type === 'reject') {
      rejectColorIndex++;
      currentIndex = rejectColorIndex;
    }
    const groupColor = this.generateColorVariant(currentIndex, this.type as any);

    const newDefects = this.items
      .filter(x => x.count > 0)
      .map(x => ({
        defectId: x.defectId,
        name: x.name,
        count: x.count,
        backgroundColor: groupColor,
      }));
    if (newDefects.length) {
      this.groupedDefects[groupKey] = newDefects;
      this.groupCounter++;
    }

    this.items.forEach(x => {
      x.count = 0;
      x.isFlipped = false;
    });

    console.log('Grouped Defects:', this.groupedDefects);
    this.onConfirm.emit(this.groupedDefects);
    this.visible = false;
    this.visibleChange.emit(false);
  }
}