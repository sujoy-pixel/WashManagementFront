
import {Directive, EventEmitter, Input, Output} from '@angular/core';
import { ProductsDetailsFilesType, ProductsDetailsTaskListType, ProductsDetailsTicketsType, ProductsDetailsTimeTrackingType, ProductsDetailsType } from 'src/app/components/apps/projects/project-details/product-details.model';
import { ProjectListType } from 'src/app/components/apps/projects/project-list/project-list.module';



export type SortColumn = keyof ProjectListType | keyof ProductsDetailsType | keyof ProductsDetailsFilesType | keyof ProductsDetailsTaskListType | keyof ProductsDetailsTimeTrackingType | keyof ProductsDetailsTicketsType | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
export class NgbdSortableHeader {

  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}