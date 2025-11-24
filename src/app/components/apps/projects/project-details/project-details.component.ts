import { DecimalPipe } from '@angular/common';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import {
  NgbdSortableHeader,
  SortEvent,
} from 'src/app/shared/directives/soratable.directive';
import {
  ProductsDetailsBillingsData,
  ProductsDetailsBillingsType,
  ProductsDetailsFilesType,
  ProductsDetailsTaskListType,
  ProductsDetailsTicketsType,
  ProductsDetailsTimeTrackingType,
  ProductsDetailsType,
} from './product-details.model';
import { ProductsDetailsService } from './product-details.service';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
  providers: [ProductsDetailsService, DecimalPipe],
})
export class ProjectDetailsComponent implements OnInit {
  model!: NgbDateStruct;
  model1!: NgbDateStruct;
  ProductDetails$: Observable<ProductsDetailsType[]>;
  total$: Observable<number>;
  productDetailsFiles$: Observable<ProductsDetailsFilesType[]>;
  productDetailsTaskList$: Observable<ProductsDetailsTaskListType[]>;
  totalTaskList$: Observable<number>;
  productDetailsTimeTracking$: Observable<ProductsDetailsTimeTrackingType[]>;
  totalTimeTracking$: Observable<number>;
  productDetailsTickets$: Observable<ProductsDetailsTicketsType[]>;
  totalTickets$: Observable<number>;

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;

  constructor(public service: ProductsDetailsService) {
    //
    this.ProductDetails$ = service.ProductDetails$;
    this.total$ = service.total$;
    // ProductsDetailsFiles
    this.productDetailsFiles$ = service.ProductsDetailsFiles$;
    // task list
    this.productDetailsTaskList$ = service.ProductsDetailsTaskList$;
    this.totalTaskList$ = service.totalTaskList$;
    // TimeTracking
    this.productDetailsTimeTracking$ = service.ProductsDetailsTimeTracking$;
    this.totalTimeTracking$ = service.totalTimeTracking$;
    // Tickets
    this.productDetailsTickets$ = service.ProductsDetailsTickets$;
    this.totalTickets$ = service.totalTickets$;
    
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
  
  //ngx-dropzone
  files: File[] = [];
  
  onSelect(event: any) {
    console.log(event);
    this.files.push(...event.addedFiles);
  }
  
  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }
  
  ProductsDetailsBillingsData!:ProductsDetailsBillingsType[];
  ngOnInit(): void {
    this.ProductsDetailsBillingsData = ProductsDetailsBillingsData
  }
  
}
