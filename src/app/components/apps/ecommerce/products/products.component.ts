import { Component, OnInit } from '@angular/core';

interface ProductType {
  id?:number;
  img?:string;
  title?: string;
  brand?:string;
  rating?:  any;
  newPrice?:string;
  oldPrice?:string;
  stock?:string;
  stockStatus?:string
}
const ProductDataList:ProductType[] = [
  {id:1, img:'./assets//images/pngs/4.png', title:'Multi Colour Flower Pot Set', brand:'brand name', rating:4, newPrice:'$200', oldPrice:'$320', stock:'item unavailable', stockStatus:'danger'},
  {id:2, img:'./assets//images/pngs/6.png', title:'Wood Photo Frame - Size(M)', brand:'brand name', rating:3, newPrice:'$50', oldPrice:'$75', stock:'in stock', stockStatus:'success'},
  {id:3, img:'./assets//images/pngs/10.png', title:'Stylilsh Sunglasses For Men', brand:'brand name', rating:3, newPrice:'$150', oldPrice:'$250', stock:'in stock', stockStatus:'success'},
  {id:4, img:'./assets//images/pngs/2.png', title:'Game Controller Joystick', brand:'brand name', rating:3, newPrice:'$550', oldPrice:'$1150', stock:'in stock', stockStatus:'success'},
  {id:5, img:'./assets//images/pngs/8.png', title:'Wall Clock - 30cm×30cm', brand:'brand name', rating:3, newPrice:'$150', oldPrice:'$170', stock:'in stock', stockStatus:'success'},
  {id:6, img:'./assets//images/pngs/5.png', title:'Long Arm Study Desk Lamp', brand:'brand name', rating:4, newPrice:'$85', oldPrice:'$150', stock:'in stock', stockStatus:'success'},
  {id:7, img:'./assets//images/pngs/3.png', title:'Headphones With Mic', brand:'brand name', rating:4, newPrice:'$175', oldPrice:'$250', stock:'in stock', stockStatus:'success'},
  {id:8, img:'./assets//images/pngs/9.png', title:'Digital Watch For Men', brand:'brand name', rating:4, newPrice:'$215', oldPrice:'$350', stock:'in stock', stockStatus:'success'},
  {id:9, img:'./assets//images/pngs/1.png', title:'Digital Camera With Lens', brand:'brand name', rating:4, newPrice:'$715', oldPrice:'$1350', stock:'item unavailable', stockStatus:'danger'}

]

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  ProductData!:ProductType[]
  rowSize:any = 'col-xl-3';
  constructor() { }

  ngOnInit(): void {
    this.ProductData = ProductDataList
  }

  twoCol(){
    this.rowSize = 'col-xl-6'
  }
  threeCol(){
    this.rowSize = 'col-xl-4'

  }
  fourCol(){
    this.rowSize = 'col-xl-3'
  }

}
