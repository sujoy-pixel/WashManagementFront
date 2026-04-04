import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { WashSetupService } from 'src/app/components/mascowash/services/washsetup.service';
import { CommonServiceService } from 'src/app/components/mascowash/services/common-service';
import { ToastrService } from 'ngx-toastr';

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
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmReject = new EventEmitter<any[]>();
  @Output() onConfirm = new EventEmitter<any>();

  items: DefectItem[] = [];
  dataList: any[] = [];

  mainModalVisible: boolean = false;
  isFullScreen: boolean = false;
  isMaximized: boolean = false;

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
  confirmSelection() {
    debugger;
    const selectedDefects = this.items
      .filter(x => x.count > 0)
      .map(x => ({
        defectId: x.defectId,
        name: x.name,
        count: x.count
      }));

    this.onConfirm.emit(selectedDefects);

    this.visible = false;
    this.visibleChange.emit(false);
  }
}