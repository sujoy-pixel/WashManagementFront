import { Routes } from '@angular/router';


export const content: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('../../components/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'advanced-ui',
    loadChildren: () => import('../../components/advanced-ui/advanced-ui.module').then(m => m.AdvancedUiModule)
  },
  {
    path: 'apps',
    loadChildren: () => import('../../components/apps/apps.module').then(m => m.AppsModule)
  },
  // {
  //   path: 'charts',
  //   loadChildren: () => import('../../components/charts/charts.module').then(m => m.ChartsModule)
  // },
  {
    path: 'forms',
    loadChildren: () => import('../../components/forms/forms.module').then(m => m.FormModule)
  },
  {
    path: 'icons',
    loadChildren: () => import('../../components/icons/icons.module').then(m => m.IconsModule)
  },
  {
    path: 'maps',
    loadChildren: () => import('../../components/maps/maps.module').then(m => m.MapsModule)
  },
  {
    path: 'pages',
    loadChildren: () => import('../../components/pages/pages.module').then(m => m.PagesModule)
  },
  {
    path: 'table',
    loadChildren: () => import('../../components/table/table.module').then(m => m.TableModule)
  },
  {
    path: 'ui-elements',
    loadChildren: () => import('../../components/ui-elements/ui-elements.module').then(m => m.UiElementsModule)
  },
  {
    path: 'utilities', loadChildren: () => import('../../components/utilities/utilities.module').then(m => m.UtilitiesModule)
  }
];
