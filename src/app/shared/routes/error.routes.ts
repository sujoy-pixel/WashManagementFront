import { Routes } from '@angular/router';

export const errorRoute: Routes = [
  {
    path: 'error-pages',
    loadChildren: () => import('../../pages/error-pages/error-pages.module').then(m => m.ErrorPagesModule),
  }
];
