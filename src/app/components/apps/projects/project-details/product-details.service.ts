/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import { Injectable, PipeTransform } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import {
  SortColumn,
  SortDirection,
} from 'src/app/shared/directives/soratable.directive';
import {
  ProductsDetailsData,
  ProductsDetailsFilesData,
  ProductsDetailsFilesType,
  ProductsDetailsTaskListData,
  ProductsDetailsTaskListType,
  ProductsDetailsTicketsData,
  ProductsDetailsTicketsType,
  ProductsDetailsTimeTrackingData,
  ProductsDetailsTimeTrackingType,
  ProductsDetailsType,
} from './product-details.model';

interface SearchResult {
  ProductDetails: ProductsDetailsType[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

// product details files
interface SearchResultFiles {
  productsDetailsFile: ProductsDetailsFilesType[];
}

// ProductsDetailsType
function sort(
  ProductDetails: ProductsDetailsType[],
  column: SortColumn,
  direction: string
): ProductsDetailsType[] {
  if (direction === '' || column === '') {
    return ProductDetails;
  } else {
    return [...ProductDetails].sort((a: any, b: any) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}
function matches(
  ProductsDetails: ProductsDetailsType,
  term: string,
  pipe: PipeTransform
) {
  return (
    ProductsDetails.name.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetails.role.toLowerCase().includes(term.toLowerCase()) ||
    pipe.transform(ProductsDetails.tasks).includes(term)
  );
}
// ProductsDetailsFilesType
function sortFiles(
  ProductDetails: ProductsDetailsFilesType[],
  column: SortColumn,
  direction: string
): ProductsDetailsFilesType[] {
  if (direction === '' || column === '') {
    return ProductDetails;
  } else {
    return [...ProductDetails].sort((a: any, b: any) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}
function matchesFiles(
  ProductsDetailsFile: ProductsDetailsFilesType,
  term: string
) {
  return (
    ProductsDetailsFile.fileName.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsFile.type.toLowerCase().includes(term.toLowerCase())
  );
}

// ProductsDetailsTaskListType
interface SearchResultTaskList {
  productsDetailsTaskList: ProductsDetailsTaskListType[];
  totalTaskList: number;
}
interface StateTaskList {
  pageTaskList: number;
  pageSizeTaskList: number;
  searchTermTaskList: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}
function sortTaskList(
  ProductDetails: ProductsDetailsTaskListType[],
  column: SortColumn,
  direction: string
): ProductsDetailsTaskListType[] {
  if (direction === '' || column === '') {
    return ProductDetails;
  } else {
    return [...ProductDetails].sort((a: any, b: any) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}
function matchesTaskList(
  ProductsDetailsTaskList: ProductsDetailsTaskListType,
  term: string,
  pipe: PipeTransform
) {
  return (
    ProductsDetailsTaskList.task.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTaskList.name.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTaskList.email.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTaskList.dueDate.toLowerCase().includes(term.toLowerCase()) ||
    pipe.transform(ProductsDetailsTaskList.id).includes(term)
  );
}
// ProductsDetailsTimeTrackingType
interface SearchResultTimeTracking {
  productsDetailsTimeTracking: ProductsDetailsTimeTrackingType[];
  totalTimeTracking: number;
}
interface StateTimeTracking {
  pageTimeTracking: number;
  pageSizeTimeTracking: number;
  searchTermTimeTracking: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}
function sortTimeTracking(
  ProductDetails: ProductsDetailsTimeTrackingType[],
  column: SortColumn,
  direction: string
): ProductsDetailsTimeTrackingType[] {
  if (direction === '' || column === '') {
    return ProductDetails;
  } else {
    return [...ProductDetails].sort((a: any, b: any) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}
function matchesTimeTracking(
  ProductsDetailsTimeTracking: ProductsDetailsTimeTrackingType,
  term: string,
  pipe: PipeTransform
) {
  return (
    ProductsDetailsTimeTracking.task.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTimeTracking.teamMembername.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTimeTracking.teamMemberemail.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTimeTracking.startDateTime.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTimeTracking.endDateTime.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTimeTracking.totalTime.toLowerCase().includes(term.toLowerCase()) ||
    pipe.transform(ProductsDetailsTimeTracking.id).includes(term)
  );
}
// ProductsDetailsTicketsType
interface SearchResultTickets {
  productsDetailsTickets: ProductsDetailsTicketsType[];
  totalTickets: number;
}
interface StateTickets {
  pageTickets: number;
  pageSizeTickets: number;
  searchTermTickets: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}
function sortTickets(
  ProductDetails: ProductsDetailsTicketsType[],
  column: SortColumn,
  direction: string
): ProductsDetailsTicketsType[] {
  if (direction === '' || column === '') {
    return ProductDetails;
  } else {
    return [...ProductDetails].sort((a: any, b: any) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}
function matchesTickets(
  ProductsDetailsTickets: ProductsDetailsTicketsType,
  term: string,
  pipe: PipeTransform
) {
  return (
    ProductsDetailsTickets.ticketId.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTickets.title.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTickets.ticketType.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTickets.client.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTickets.name.toLowerCase().includes(term.toLowerCase()) ||
    ProductsDetailsTickets.email.toLowerCase().includes(term.toLowerCase()) ||
    pipe.transform(ProductsDetailsTickets.id).includes(term)
  );
}

@Injectable({ providedIn: 'root' })
export class ProductsDetailsService {
  private _countries$ = new BehaviorSubject<ProductsDetailsType[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  // product details  files
  private _searchFiles$ = new Subject<void>();
  private _productDetailsFile$ = new BehaviorSubject<
  ProductsDetailsFilesType[]
  >([]);
  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  // product details  Task list
  private _searchTaskList$ = new Subject<void>();
  private _productDetailsTaskList$ = new BehaviorSubject<ProductsDetailsTaskListType[]>([]);
  private _totalTaskList$ = new BehaviorSubject<number>(0);
  private _stateTaskList: StateTaskList = {
    pageTaskList: 1,
    pageSizeTaskList: 5,
    searchTermTaskList: '',
    sortColumn: '',
    sortDirection: '',
  };

  // product details  TimeTracking
  private _searchTimeTracking$ = new Subject<void>();
  private _productDetailsTimeTracking$ = new BehaviorSubject<ProductsDetailsTimeTrackingType[]>([]);
  private _totalTimeTracking$ = new BehaviorSubject<number>(0);
  private _stateTimeTracking: StateTimeTracking = {
    pageTimeTracking: 1,
    pageSizeTimeTracking: 5,
    searchTermTimeTracking: '',
    sortColumn: '',
    sortDirection: '',
  };
  // product details  Tickets
  private _searchTickets$ = new Subject<void>();
  private _productDetailsTickets$ = new BehaviorSubject<ProductsDetailsTicketsType[]>([]);
  private _totalTickets$ = new BehaviorSubject<number>(0);
  private _stateTickets: StateTickets = {
    pageTickets: 1,
    pageSizeTickets: 5,
    searchTermTickets: '',
    sortColumn: '',
    sortDirection: '',
  };


  constructor(private pipe: DecimalPipe) {
    //   Product details member
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._countries$.next(result.ProductDetails);
        this._total$.next(result.total);
      });

    this._search$.next();

    // Products details Files
    this._searchFiles$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchProductDetailsFiles()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._productDetailsFile$.next(result.productsDetailsFile);
      });

    this._searchFiles$.next();

    // Products details Task List
    this._searchTaskList$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchProductDetailsTaskList()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._productDetailsTaskList$.next(result.productsDetailsTaskList);
        this._totalTaskList$.next(result.totalTaskList);
      });

    this._searchTaskList$.next();
    // Products details TimeTracking
    this._searchTimeTracking$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchProductDetailsTimeTracking()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._productDetailsTimeTracking$.next(result.productsDetailsTimeTracking);
        this._totalTimeTracking$.next(result.totalTimeTracking);
      });

    this._searchTimeTracking$.next();
    // Products details Tickets
    this._searchTickets$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchProductDetailsTickets()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result) => {
        this._productDetailsTickets$.next(result.productsDetailsTickets);
        this._totalTickets$.next(result.totalTickets);
      });

    this._searchTickets$.next();
  }

  
  get loading$() {
    return this._loading$.asObservable();
  }
  get ProductDetails$() {
    return this._countries$.asObservable();
  }
  get total$() {
    return this._total$.asObservable();
  }
  
  get searchTerm() {
    return this._state.searchTerm;
  }
  get page() {
    return this._state.page;
  }
  get pageSize() {
    return this._state.pageSize;
  }
  set page(page: number) {
    this._set({ page });
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }
  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }
  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } =
      this._state;

    // 1. sort
    let ProductDetails = sort(ProductsDetailsData, sortColumn, sortDirection);

    // 2. filter
    ProductDetails = ProductDetails.filter((ProductsDetails) =>
      matches(ProductsDetails, searchTerm, this.pipe)
    );
    const total = ProductDetails.length;

    // 3. paginate
    ProductDetails = ProductDetails.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize
    );
    return of({ ProductDetails, total });
  }
  // Product details Files
  get ProductsDetailsFiles$() {
    return this._productDetailsFile$.asObservable();
  }
  private _searchProductDetailsFiles(): Observable<SearchResultFiles> {
    const { sortColumn, sortDirection, searchTerm } = this._state;

    // 1. sort
    let productsDetailsFile = sortFiles(
      ProductsDetailsFilesData,
      sortColumn,
      sortDirection
    );

    // 2. filter
    productsDetailsFile = productsDetailsFile.filter((ProductsDetailsFile) =>
      matchesFiles(ProductsDetailsFile, searchTerm)
    );

    return of({ productsDetailsFile });
  }
  // product details Task list
  get ProductsDetailsTaskList$() {
    return this._productDetailsTaskList$.asObservable();
  }
  get totalTaskList$() {
    return this._totalTaskList$.asObservable();
  }
  get pageTaskList() {
    return this._stateTaskList.pageTaskList;
  }
  get pageSizeTaskList() {
    return this._stateTaskList.pageSizeTaskList;
  }
  get searchTermTaskList() {
    return this._stateTaskList.searchTermTaskList;
  }
  set pageTaskList(pageTaskList: number) {
    this._setTaskList({ pageTaskList });
  }
  set pageSizeTaskList(pageSizeTaskList: number) {
    this._setTaskList({ pageSizeTaskList });
  }
  set searchTermTaskList(searchTermTaskList: string) {
    this._setTaskList({ searchTermTaskList });
  }
  set sortColumnTaskList(sortColumn: SortColumn) {
    this._setTaskList({ sortColumn });
  }
  set sortDirectionTaskList(sortDirection: SortDirection) {
    this._setTaskList({ sortDirection });
  }
  private _setTaskList(patch: Partial<StateTaskList>) {
    Object.assign(this._stateTaskList, patch);
    this._searchTaskList$.next();
  }
  private _searchProductDetailsTaskList(): Observable<SearchResultTaskList> {
    const {
      sortColumn,
      sortDirection,
      pageSizeTaskList,
      pageTaskList,
      searchTermTaskList,
    } = this._stateTaskList;

    // 1. sort
    let productsDetailsTaskList = sortTaskList(
      ProductsDetailsTaskListData,
      sortColumn,
      sortDirection
    );

    // 2. filter
    productsDetailsTaskList = productsDetailsTaskList.filter(
      (ProductsDetails) =>
        matchesTaskList(ProductsDetails, searchTermTaskList, this.pipe)
    );
    const totalTaskList = productsDetailsTaskList.length;

    // 3. paginate
    productsDetailsTaskList = productsDetailsTaskList.slice(
      (pageTaskList - 1) * pageSizeTaskList,
      (pageTaskList - 1) * pageSizeTaskList + pageSizeTaskList
    );
    return of({ productsDetailsTaskList, totalTaskList });
  }
  // product details TimeTracking
  get ProductsDetailsTimeTracking$() {
    return this._productDetailsTimeTracking$.asObservable();
  }
  get totalTimeTracking$() {
    return this._totalTimeTracking$.asObservable();
  }
  get pageTimeTracking() {
    return this._stateTimeTracking.pageTimeTracking;
  }
  get pageSizeTimeTracking() {
    return this._stateTimeTracking.pageSizeTimeTracking;
  }
  get searchTermTimeTracking() {
    return this._stateTimeTracking.searchTermTimeTracking;
  }
  set pageTimeTracking(pageTimeTracking: number) {
    this._setTimeTracking({ pageTimeTracking });
  }
  set pageSizeTimeTracking(pageSizeTimeTracking: number) {
    this._setTimeTracking({ pageSizeTimeTracking });
  }
  set searchTermTimeTracking(searchTermTimeTracking: string) {
    this._setTimeTracking({ searchTermTimeTracking });
  }
  set sortColumnTimeTracking(sortColumn: SortColumn) {
    this._setTimeTracking({ sortColumn });
  }
  set sortDirectionTimeTracking(sortDirection: SortDirection) {
    this._setTimeTracking({ sortDirection });
  }
  private _setTimeTracking(patch: Partial<StateTimeTracking>) {
    Object.assign(this._stateTimeTracking, patch);
    this._searchTimeTracking$.next();
  }
  private _searchProductDetailsTimeTracking(): Observable<SearchResultTimeTracking> {
    const {
      sortColumn,
      sortDirection,
      pageSizeTimeTracking,
      pageTimeTracking,
      searchTermTimeTracking,
    } = this._stateTimeTracking;

    // 1. sort
    let productsDetailsTimeTracking = sortTimeTracking(
      ProductsDetailsTimeTrackingData,
      sortColumn,
      sortDirection
    );

    // 2. filter
    productsDetailsTimeTracking = productsDetailsTimeTracking.filter(
      (ProductsDetails) =>
        matchesTimeTracking(ProductsDetails, searchTermTimeTracking, this.pipe)
    );
    const totalTimeTracking = productsDetailsTimeTracking.length;

    // 3. paginate
    productsDetailsTimeTracking = productsDetailsTimeTracking.slice(
      (pageTimeTracking - 1) * pageSizeTimeTracking,
      (pageTimeTracking - 1) * pageSizeTimeTracking + pageSizeTimeTracking
    );
    return of({ productsDetailsTimeTracking, totalTimeTracking });
  }
  // product details Tickets
  get ProductsDetailsTickets$() {
    return this._productDetailsTickets$.asObservable();
  }
  get totalTickets$() {
    return this._totalTickets$.asObservable();
  }
  get pageTickets() {
    return this._stateTickets.pageTickets;
  }
  get pageSizeTickets() {
    return this._stateTickets.pageSizeTickets;
  }
  get searchTermTickets() {
    return this._stateTickets.searchTermTickets;
  }
  set pageTickets(pageTickets: number) {
    this._setTickets({ pageTickets });
  }
  set pageSizeTickets(pageSizeTickets: number) {
    this._setTickets({ pageSizeTickets });
  }
  set searchTermTickets(searchTermTickets: string) {
    this._setTickets({ searchTermTickets });
  }
  set sortColumnTickets(sortColumn: SortColumn) {
    this._setTickets({ sortColumn });
  }
  set sortDirectionTickets(sortDirection: SortDirection) {
    this._setTickets({ sortDirection });
  }
  private _setTickets(patch: Partial<StateTickets>) {
    Object.assign(this._stateTickets, patch);
    this._searchTickets$.next();
  }
  private _searchProductDetailsTickets(): Observable<SearchResultTickets> {
    const {
      sortColumn,
      sortDirection,
      pageSizeTickets,
      pageTickets,
      searchTermTickets,
    } = this._stateTickets;

    // 1. sort
    let productsDetailsTickets = sortTickets(
      ProductsDetailsTicketsData,
      sortColumn,
      sortDirection
    );

    // 2. filter
    productsDetailsTickets = productsDetailsTickets.filter(
      (ProductsDetails) =>
        matchesTickets(ProductsDetails, searchTermTickets, this.pipe)
    );
    const totalTickets = productsDetailsTickets.length;

    // 3. paginate
    productsDetailsTickets = productsDetailsTickets.slice(
      (pageTickets - 1) * pageSizeTickets,
      (pageTickets - 1) * pageSizeTickets + pageSizeTickets
    );
    return of({ productsDetailsTickets, totalTickets });
  }
}
