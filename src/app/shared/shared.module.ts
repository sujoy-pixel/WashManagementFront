import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// components 
import { HeaderComponent } from './layout-components/header/header.component';
import { FooterComponent } from './layout-components/footer/footer.component';
import { LoaderComponent } from './layout-components/loader/loader.component';
import { PageHeaderComponent } from './layout-components/page-header/page-header.component';
import { SidebarComponent } from './layout-components/sidebar/sidebar.component';
import { SwitcherComponent } from './layout-components/switcher/switcher.component';
import { TabToTopComponent } from './layout-components/tab-to-top/tab-to-top.component';
import { ContentLayoutComponent } from './layout-components/layout/content-layout/content-layout.component';
import { ErrorLayoutComponent } from './layout-components/layout/error-layout/error-layout.component';
import { FullLayoutComponent } from './layout-components/layout/full-layout/full-layout.component';
// Directives
import { FullscreenDirective } from './directives/fullscreen-toggle.directive';
import { ToggleBtnDirective } from './directives/toggle-btn.directive';
import { SidemenuToggleDirective } from './directives/sidemenuToggle';
import { ToggleThemeDirective } from './directives/toggle-theme.directive';
import { HoverEffectSidebarDirective } from './directives/hover-effect-sidebar.directive';
// Plugins
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgbdSortableHeader } from './directives/soratable.directive';
import { FormsModule } from '@angular/forms';
import { SwitcherLayoutComponent } from './layout-components/layout/switcher-layout/switcher-layout.component';
import { SwitcherLayoutHeaderComponent } from './layout-components/layout/switcher-layout/switcher-layout-header/switcher-layout-header.component';
import { LandingPageLayoutComponent } from './layout-components/layout/landingpage-layout/landingpage-layout.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: false
};

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    PageHeaderComponent,
    SidebarComponent,
    SwitcherComponent,
    TabToTopComponent,
    ContentLayoutComponent,
    ErrorLayoutComponent,
    FullLayoutComponent,
    LandingPageLayoutComponent,
    NgbdSortableHeader,
    FullscreenDirective,
    ToggleBtnDirective,
    SidemenuToggleDirective,
    ToggleThemeDirective,
    HoverEffectSidebarDirective,
    SwitcherLayoutComponent,
    SwitcherLayoutHeaderComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    RouterModule,
    PerfectScrollbarModule,
    ColorPickerModule,
    FormsModule
  ],
  exports : [
    PageHeaderComponent, TabToTopComponent, FullLayoutComponent, ContentLayoutComponent, ErrorLayoutComponent, SwitcherComponent, LoaderComponent,ToggleBtnDirective, ToggleThemeDirective, NgbdSortableHeader, LandingPageLayoutComponent, SidemenuToggleDirective
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
  ]
})
export class SharedModule { }
