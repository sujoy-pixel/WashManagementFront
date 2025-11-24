import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductsComponent } from './products/products.component';
import { WishlistComponent } from './wishlist/wishlist.component';

const routes: Routes = [
  {path:'eCommerce', children: [
    {path:'cart', component: CartComponent},
    {path:'checkout', component: CheckoutComponent},
    {path:'products', component: ProductsComponent},
    {path:'product-details', component: ProductDetailsComponent},
    {path:'wishlist', component: WishlistComponent},
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcommerceRoutingModule { }
