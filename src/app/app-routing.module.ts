import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { LoginComponent } from './auth/login/login.component';
import { ResisterComponent } from './auth/resister/resister.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { AdminGuard } from './shared/guard/admin.guard';
import { ContentLayoutComponent } from './shared/layout-components/layout/content-layout/content-layout.component';
import { ErrorLayoutComponent } from './shared/layout-components/layout/error-layout/error-layout.component';
import { FullLayoutComponent } from './shared/layout-components/layout/full-layout/full-layout.component';
import { LandingPageLayoutComponent } from './shared/layout-components/layout/landingpage-layout/landingpage-layout.component';
import { SwitcherLayoutComponent } from './shared/layout-components/layout/switcher-layout/switcher-layout.component';
import { customRoute } from './shared/routes/custom.routes';
import { errorRoute } from './shared/routes/error.routes';
import { LandingPage } from './shared/routes/landingpage';
import { content } from './shared/routes/routes copy';
import { switcher } from './shared/routes/switchers';
import { SharedModule } from './shared/shared.module';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { HomePageComponent } from './pages/home-page/home-page.component';

// const routes: Routes = [
//   {
//     path: '',
//     redirectTo: '/dashboard',
//     pathMatch: 'full'
//   },
//   // // Vertical layout
//   {
//     path: '',
//     component: ContentLayoutComponent,
//     canActivate: [AdminGuard],
//     children: content
//   },
//   {
//     path: '',
//     component: SwitcherLayoutComponent,
//     canActivate: [AdminGuard],
//     children: switcher
//   },
//   {
//     path: '',
//     component: ErrorLayoutComponent,
//     canActivate: [AdminGuard],
//     children: errorRoute
//   },
//   {
//     path: '',
//     component: LandingPageLayoutComponent,
//     canActivate: [AdminGuard],
//     children: LandingPage
//   },
//   {
//     path: '',
//     component: FullLayoutComponent,
//     canActivate: [AdminGuard],
//     children: customRoute
//   },
//   {
//     path: '',
//     loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
//   },
//   {
//     path: '',
//     loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule),
//   },
//   {
//     path: '**',
//     redirectTo: '/error-pages/error-404'
//   },
// ];

const routes: Routes = [
  {
    path: "",
    redirectTo: "auth/login",
    //redirectTo: "/dashboard/default/",
    // this.router.navigate(["/dashboard/default/"]);
    pathMatch: "full",
  },
  {
    path: "",
    // redirectTo: "home",
    component: HomePageComponent,
    //redirectTo: "/dashboard/default/",
    // this.router.navigate(["/dashboard/default/"]);
    pathMatch: "full",
  },

  // {
  //   path: "dashboard",
  //   component: ContentLayoutComponent,
  //   runGuardsAndResolvers: "always",
  //   canActivate: [AdminGuard],
  //   children: [
  //     {
  //       path: "dashboard",
  //       loadChildren: () =>
  //         import("./components/dashboard/dashboard.module").then(
  //           (m) => m.DashboardModule
  //         ),
  //     },

    
  //   ],
  // },
  {
    path: "dashboard",
    component: ContentLayoutComponent,
    runGuardsAndResolvers: "always",
    //canActivate: [AdminGuard],
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
