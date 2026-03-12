import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';

@Component({
  selector: 'app-custom-pagination',
  templateUrl: './custom-pagination.component.html',
  styleUrls: ['./custom-pagination.component.scss']
})
export class CustomPaginationComponent implements OnChanges {

  @Input() totalRecords: number = 0;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [10,20,30];

  @Output() pageChange = new EventEmitter<any>();

  currentPage = 1;
  totalPages = 10;
  pages: number[] = [];

  ngOnChanges() {
    this.calculatePages();
  }

  calculatePages() {
    this.totalPages = Math.ceil(this.totalRecords / this.rows);
    this.pages = [];

    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      this.pages.push(i);
    }
  }

  changePage(page: number) {

    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;

    this.calculatePages();

    this.pageChange.emit({
      first: (page - 1) * this.rows,
      rows: this.rows,
      page: page - 1
    });
  }

  changeRows(event:any){

    this.rows = Number(event.target.value);
    this.currentPage = 1;

    this.calculatePages();

    this.pageChange.emit({
      first: 0,
      rows: this.rows,
      page: 0
    });
  }

  get startRecord(){
    return (this.currentPage - 1) * this.rows + 1;
  }

  get endRecord(){
    return Math.min(this.currentPage * this.rows, this.totalRecords);
  }
}