import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EcommerceRoutingModule } from './ecommerce-routing.module';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    CartComponent,
    CheckoutComponent,
    ProductsComponent,
    ProductDetailsComponent,
    WishlistComponent
  ],
  imports: [
    CommonModule,
    EcommerceRoutingModule,
    SharedModule,
    NgbModule,
    NgSelectModule
  ]
})
export class EcommerceModule { }
