import { Component, OnInit } from '@angular/core';

interface WishlistType{
  id?:number;
  productImg?: string;
  title?: string;
  price?: string;
  status?: string;
  statusText?: string;
}

const WishlistData:WishlistType[]=[
  {id:1, productImg:'./assets//images/pngs/1.png', title:'Digital Camera Pro 30.2MP With Lens', price:'568', status:'success', statusText:'Stock'},
  {id:2, productImg:'./assets//images/pngs/4.png', title:'Attractive Multi Color Flower Pot - Combo Of 3', price:'1027', status:'danger', statusText:'Out ofstock'},
  {id:3, productImg:'./assets//images/pngs/8.png', title:'Analog Wall Clock - 30cm × 30cm', price:'1589', status:'success', statusText:'Stock'},
  {id:4, productImg:'./assets//images/pngs/2.png', title:'Wireless Bluetooth Game Controller Joystick', price:'356', status:'success', statusText:'Stock'},
  {id:5, productImg:'./assets//images/pngs/3.png', title:'Bluetooth V5.1 Headphones With Mic - Wired Headset', price:'1245', status:'danger', statusText:'Out of stock'},
  {id:6, productImg:'./assets//images/pngs/6.png', title:'Wood Photo Frame(M) With Wall Decorators', price:'783', status:'success', statusText:'Stock'},
  {id:7, productImg:'./assets//images/pngs/10.png', title:'Stylilsh Cruved Sunglasses For Men - Pack of 3', price:'4876', status:'success', statusText:'Stock'},
  {id:8, productImg:'./assets//images/pngs/9.png', title:'Rounded Shape Digital Watch For Men', price:'13876', status:'success', statusText:'Stock'},
]

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  public WishlistItems!:WishlistType[];
  constructor() { }

  ngOnInit(): void {
    this.WishlistItems = WishlistData
  }

  removeItem(itemId:any){
    this.WishlistItems.map((el,index)=>{
      if(el.id === itemId){
        this.WishlistItems.splice(index,1)
      }
    })
  }
}
