import { Component, OnInit } from '@angular/core';

interface CardDataType {
  id?:number;
  img?: string;
  title?: string;
  price?: string;
  items?:number;
}
const CardDataList:CardDataType[] = [
  {id:1, img:'./assets//images/pngs/1.png', title:'Digital Camera Pro 30.2MP With Lens', price:'$3,950', items:1},
  {id:2, img:'./assets//images/pngs/4.png', title:'Attractive Multi Color Flower Pot - Combo Of 3', price:'$105', items:3},
  {id:3, img:'./assets//images/pngs/2.png', title:'Wireless Bluetooth Game Controller Joystick', price:'$945', items:3},
  {id:4, img:'./assets//images/pngs/5.png', title:'Long Arm Rechargeable Study Desk Lamp', price:'$105', items:2},
  {id:5, img:'./assets//images/pngs/6.png', title:'Wood Photo Frame(M) With Wall Decorators', price:'$106', items:5},
  {id:6, img:'./assets//images/pngs/9.png', title:'Rounded Shape Digital Watch For Men', price:'$230', items:1},
  {id:7, img:'./assets//images/pngs/8.png', title:'Analog Wall Clock - 30cm × 30cm', price:'$110', items:1},
]
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  CartData!: CardDataType[];
  constructor() { }

  ngOnInit(): void {
    this.CartData = CardDataList
  }

  DeleteRow(item:any){
    this.CartData.forEach((e,i)=>{
      if(e.id === item){
        this.CartData.splice(i, 1)
      }
    })
  }
}
