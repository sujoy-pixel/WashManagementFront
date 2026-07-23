import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentLayoutComponent } from './shared/layout-components/layout/content-layout/content-layout.component';
import { HomePageComponent } from './pages/home-page/home-page.component';


const routes: Routes = [
  {
    path: "",
    redirectTo: "auth/login",
    pathMatch: "full",
  },
  {
    path: "",
    component: HomePageComponent,
    pathMatch: "full",
  },
  {
    path: "dashboard",
    component: ContentLayoutComponent,
    runGuardsAndResolvers: "always",
    loadChildren: () =>
      import("./components/dashboard/dashboard.module").then(
        (m) => m.DashboardModule
      ),
  },
  {
    path: "",
    loadChildren: () =>
      import("./auth/auth.module").then((m) => m.AuthModule),
  },

  {
    path: "",
    component: ContentLayoutComponent,
    runGuardsAndResolvers: "always",
    loadChildren: () =>
      import("./components/mascowash/mascowash.module").then((m) => m.MascowashModule),
  },
  {
    path: "**",
    redirectTo: "auth/login/1",
    pathMatch: "full",
  },
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
