import { Routes } from '@angular/router';


export const LandingPage: Routes = [
  {
    path: 'landing',
    loadChildren: () => import('../../components/landing-page/landing-page.module').then(m => m.LandingPageModule)
  },
];

