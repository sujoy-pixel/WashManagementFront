import { Component, OnInit } from '@angular/core';

interface ProductDetailsType {
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
const ProductDetailsDataList:ProductDetailsType[] = [
  {id:1, img:'./assets//images/pngs/6.png', title:'Wood Photo Frame - Size(M)', brand:'brand name', rating:4, newPrice:'$50', oldPrice:'$75', stock:'in stock', stockStatus:'success'},
  {id:2, img:'./assets//images/pngs/10.png', title:'Stylilsh Sunglasses For Men', brand:'brand name', rating:3, newPrice:'$150', oldPrice:'$250', stock:'in stock', stockStatus:'success'},
  {id:3, img:'./assets//images/pngs/2.png', title:'Game Controller Joystick', brand:'brand name', rating:3, newPrice:'$550', oldPrice:'$1150', stock:'in stock', stockStatus:'success'},
  {id:4, img:'./assets//images/pngs/8.png', title:'Wall Clock - 30cm×30cm', brand:'brand name', rating:3, newPrice:'$150', oldPrice:'$170', stock:'in stock', stockStatus:'success'}
]

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  ProductsDetailsItems!: ProductDetailsType[];
  constructor() { }

  ngOnInit(): void {
    this.ProductsDetailsItems = ProductDetailsDataList
  }

}
