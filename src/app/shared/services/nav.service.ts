import { Injectable, OnDestroy,Inject,HostListener } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { WINDOW } from "./windows.service";

// Menu
export interface Menu {
	 headTitle?: string,
	headTitle2?: string,
	badgeClass? :string;
	Menusub?: boolean;
	target?:boolean;



	path?: string;
	title?: string;
	icon?: string;
	type?: string;
	badgeType?: string;
	badgeValue?: string;
	active?: boolean;
	bookmark?: boolean;
	pendingTask?: number;
	children?: Menu[];
	menu_Name?:string;
}

@Injectable({
	providedIn: 'root'
})

export class NavService implements OnDestroy {

	private unsubscriber: Subject<any> = new Subject();
	public  screenWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

	// Search Box
	public search: boolean = false;

	// Language
	public language: boolean = false;
	
	// Mega Menu
	public megaMenu: boolean = false;
	public levelMenu: boolean = false;
	public megaMenuColapse: boolean = window.innerWidth < 1199 ? true : false;

	// Collapse Sidebar
	public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;

	// For Horizontal Layout Mobile
	public horizontal: boolean = window.innerWidth < 991 ? false : true;

	// Full screen
	public fullScreen: boolean = false;

	constructor(private router: Router) {
		this.setScreenWidth(window.innerWidth);
		fromEvent(window, 'resize').pipe(
			debounceTime(1000),
			takeUntil(this.unsubscriber)
		).subscribe((evt: any) => {
			this.setScreenWidth(evt.target.innerWidth);
			if (evt.target.innerWidth < 991) {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			}
			if(evt.target.innerWidth < 1199) {
				this.megaMenuColapse = true;
			}
		});
		if(window.innerWidth < 991) { // Detect Route change sidebar close
			this.router.events.subscribe(event => { 
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			});
		}
	}

	ngOnDestroy() {
		this.unsubscriber.next;
		this.unsubscriber.complete();
	}

	private setScreenWidth(width: number): void {
		this.screenWidth.next(width);
	}


	//public screenWidth: any;
	//public collapseSidebar = false;
	MENUITEMS: Menu[] = [
		{
			headTitle: 'MENU',
		},
		{
			title: 'Dashboard', icon: 'home', active: true, badgeClass:'badge badge-sm bg-secondary badge-hide', badgeValue:'new', path: '/dashboard', type: 'link'
		},
		{
			headTitle: 'COMPONENTS',
		},
		{
			title: 'Forms', icon: 'file', type: 'sub', Menusub: true, active: false, children: [
				{ path: '/forms/form-elements', title: 'Form Elements', type: 'link' },
				{ path: '/forms/form-layouts', title: 'Form Layouts', type: 'link' },
				{ path: '/forms/form-validation', title: 'Form Validations', type: 'link' },
				{ path: '/forms/form-advanced', title: 'Form Advanced', type: 'link' },
				{ path: '/forms/form-editors', title: 'Form Editor', type: 'link' },
				{ path: '/forms/form-wizard', title: 'Form Wizards', type: 'link' },
			]
		},
		{
			title: 'Tables', icon: 'layout', type: 'sub', Menusub: true, active: false, children: [
				{ path: '/table/default-table', title: 'Default Table', type: 'link' },
				{ path: '/table/data-table', title: 'Data Table', type: 'link' },
				{ path: '/table/editable-table', title: 'Editable Table', type: 'link' },
			]
		},
		{ path: '/landing',icon: 'send', title: 'Landing Page', type: 'external', badgeClass:'secondary', badgeValue:'new' },
		{
			title: 'Charts', icon: 'bar-chart', type: 'sub', Menusub: true, active: false, children: [
				{ path: '/charts/chartjs', title: 'chartjs-charts', type: 'link' },
				{ path: '/charts/e-charts', title: 'Echarts', type: 'link' },
				{ path: '/charts/apex-charts', title: 'apex-charts', type: 'link' },
				{ path: '/charts/chartlist', title: 'chartlist', type: 'link' }
			]
		},
		{
			title: 'Icons', icon: 'activity' ,type: 'sub', Menusub: true, active: false, children: [
				{ path: '/icons/font-awsome', title: 'Font Awsome', type: 'link' },
				{ path: '/icons/material-design-icons', title: 'Material Design Icons', type: 'link' },
				{ path: '/icons/simple-line-icons', title: 'Simple Line Icons', type: 'link' },
				{ path: '/icons/feather-icons', title: 'Feather Icons', type: 'link' },
				{ path: '/icons/ionic-icons', title: 'Ionic Icons', type: 'link' },
				{ path: '/icons/flag-icons', title: 'Flag Icons', type: 'link' },
				{ path: '/icons/pe7-icons', title: 'Pe7 Icons', type: 'link' },
				{ path: '/icons/themify-icons', title: 'Themify Icons', type: 'link' },
				{ path: '/icons/typicons', title: 'Typicons', type: 'link' },
				{ path: '/icons/weather-icons', title: 'Weather Icons', type: 'link' },
			]
		},
		{
			title: 'Maps', icon: 'map-pin', type: 'sub', Menusub: true, active: false, children: [
				{ path: '/maps/leaflet', title: 'Leaflet', type: 'link' },
			]
		},

		{
			headTitle: "SUBMENU'S",
		},
		{
			title: 'Submenus', icon: 'share-2', type: 'sub', Menusub: true, active: false, children: [
				{ path: '', title: 'Submenu-1', type: 'empty' },
				{
					title: 'Submenu-2', type: 'sub', Menusub: true, active: false, children: [
						{ path: '', title: 'Submenu-2.1', type: 'empty' },
						{ path: '', title: 'Submenu-2.2', type: 'empty' },
					]
				},
			]
		},

		{
			headTitle: 'WEB APPS',
		},
		{
			title: 'Apps', icon: 'grid', type: 'sub', Menusub: true, active: false, children: [
				{ path: '/apps/calendar', title: 'Calendar', type: 'link' },
				{ path: '/apps/chat', title: 'Chat', type: 'link' },
				{
					title: 'ECommerce', icon: 'shopping-bag', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/apps/eCommerce/cart', title: 'Cart', type: 'link' },
						{ path: '/apps/eCommerce/checkout', title: 'Checkout', type: 'link' },
						{ path: '/apps/eCommerce/products', title: 'Products', type: 'link' },
						{ path: '/apps/eCommerce/product-details', title: 'Product Details', type: 'link' },
						{ path: '/apps/eCommerce/wishlist', title: 'Wishlist', type: 'link' },
					]
				},
				{
					title: 'File Manager', icon: 'shopping-bag', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/apps/file-manager/files', title: 'Files', type: 'link' },
						{ path: '/apps/file-manager/file-manager', title: 'Files Manager', type: 'link' },
						{ path: '/apps/file-manager/file-details', title: 'File Details', type: 'link' },
					]
				},
				{
					title: 'E-Mail', icon: 'shopping-bag', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/apps/mail/inbox', title: 'Inbox', type: 'link' },
						{ path: '/apps/mail/compose-mail', title: 'Compose Mail', type: 'link' },
						{ path: '/apps/mail/read-mail', title: 'Read Mail', type: 'link' },
						{ path: '/apps/mail/mail-settings', title: 'Mail Settings', type: 'link' },
					]
				},
				{
					title: 'Invoices', icon: 'shopping-bag', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/apps/invoice/invoice-list', title: 'Invoice List', type: 'link' },
						{ path: '/apps/invoice/invoice-details', title: 'Invoice Details', type: 'link' },
						{ path: '/apps/invoice/create-invoice', title: 'Create Invoice', type: 'link' },
						{ path: '/apps/invoice/time-log-invoice', title: 'Time log Invoice', type: 'link' },
						{ path: '/apps/invoice/edit-invoice', title: 'Edit Invoice', type: 'link' },
					]
				},
				{
					title: 'Projects', icon: 'shopping-bag', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/apps/projects/projects', title: 'Projects', type: 'link' },
						{ path: '/apps/projects/project-list', title: 'Project List', type: 'link' },
						{ path: '/apps/projects/project-details', title: 'Project Details', type: 'link' },
						{ path: '/apps/projects/project-new', title: 'Project New', type: 'link' },
						{ path: '/apps/projects/edit-project', title: 'Edit Project', type: 'link' },
					]
				},
				{ path: '/apps/tickets', title: 'Tickets', type: 'link' },
				{
					title: 'Tasks', icon: 'shopping-bag', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/apps/task/task-list', title: 'Task List', type: 'link' },
						{ path: '/apps/task/edit-task', title: 'Edit Task', type: 'link' },
						{ path: '/apps/task/create-task', title: 'Create Task', type: 'link' },
					]
				},
				{
					title: 'Client', icon: 'shopping-bag', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/apps/client/client', title: 'Client', type: 'link' },
						{ path: '/apps/client/add-client', title: 'Add Client', type: 'link' },
					]
				},
			]
		},

		{
			title: 'UI Elements', icon: 'database', type: 'sub', Menusub: true, active: false, children: [
				{ path: '/ui-elements/alerts', title: 'Alerts', type: 'link' },
				{ path: '/ui-elements/avatar', title: 'Avatar', type: 'link' },
				{ path: '/ui-elements/badges', title: 'Badges', type: 'link' },
				{ path: '/ui-elements/breadcrumbs', title: 'Breadcrumb', type: 'link' },
				{ path: '/ui-elements/buttons', title: 'Buttons', type: 'link' },
				{ path: '/ui-elements/colors', title: 'Colors', type: 'link' },
				{ path: '/ui-elements/dropdown', title: 'Dropdown', type: 'link' },
				{ path: '/ui-elements/gallery', title: 'Gallery', type: 'link' },
				{ path: '/ui-elements/loaders', title: 'Loaders', type: 'link' },
				{ path: '/ui-elements/navigation', title: 'Navigation', type: 'link' },
				{ path: '/ui-elements/pagination', title: 'Pagination', type: 'link' },
				{ path: '/ui-elements/panels', title: 'Panels', type: 'link' },
				{ path: '/ui-elements/range-slider', title: 'range-slider', type: 'link' },
				{ path: '/ui-elements/scroll', title: 'Scroll', type: 'link' },
				{ path: '/ui-elements/tags', title: 'Tags', type: 'link' },
				{ path: '/ui-elements/thumbnails', title: 'Thumbnails', type: 'link' },
				{ path: '/ui-elements/treeview', title: 'Treeview', type: 'link' },
				{ path: '/ui-elements/typography', title: 'Typography', type: 'link' },
			]
		},
		{
			title: 'Advanced Ui', icon: 'shield', type: 'sub', Menusub: true, active: false, children: [
				{ path: '/advanced-ui/accordion', title: 'Accordion', type: 'link' },
				{ path: '/advanced-ui/carousel', title: 'Carousel', type: 'link' },
				{ path: '/advanced-ui/cards', title: 'Cards', type: 'link' },
				{ path: '/advanced-ui/counters', title: 'Counters', type: 'link' },
				{ path: '/advanced-ui/modals', title: 'Modals', type: 'link' },
				{ path: '/advanced-ui/timeline', title: 'Timeline', type: 'link' },
				{ path: '/advanced-ui/sweet-alert', title: 'Sweet Alert', type: 'link' },
				{ path: '/advanced-ui/ratings', title: 'Ratings', type: 'link' },
				{ path: '/advanced-ui/media-object', title: 'Media Object', type: 'link' },
				{ path: '/advanced-ui/tabs', title: 'Tabs', type: 'link' },
				{ path: '/advanced-ui/tooltip-popover', title: 'Tooltip & Popover', type: 'link' },
				{ path: '/advanced-ui/progressbar', title: 'Progressbar', type: 'link' },
				{ path: '/advanced-ui/footers', title: 'Footers', type: 'link' },
				{ path: '/advanced-ui/userlist', title: 'Userlist', type: 'link' },
				{ path: '/advanced-ui/file-attachments', title: 'File Attachments', type: 'link' },
			]
		},
		{
			headTitle: 'PAGES',
		},
		{
			title: 'Pages', icon: 'layers', type: 'sub', Menusub: true, active: false, children: [
				{
					title: 'Authentication', icon: 'shopping-bag', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/custom-pages/signin', title: 'Sign In', type: 'link' },
						{ path: '/custom-pages/signup', title: 'Sign Up', type: 'link' },
						{ path: '/custom-pages/forget-password', title: 'Forget Password', type: 'link' },
						{ path: '/custom-pages/lockscreen', title: 'Lock Screen', type: 'link' },
						{ path: '/custom-pages/under-construction', title: 'Under Construction', type: 'link' },
					]
				},
				{
					title: 'Error Pages', icon: 'shopping-bag', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/error-pages/error-404', title: 'Error 404', type: 'link' },
						{ path: '/error-pages/error-500', title: 'Error 500', type: 'link' },
						{ path: '/error-pages/error-501', title: 'Error 501', type: 'link' },
					]
				},
				
				{ path: '/pages/settings', title: 'Settings', type: 'link' },
				{ path: '/pages/profile', title: 'Profile', type: 'link' },
				{ path: '/pages/about-company', title: 'About Company', type: 'link' },
				{ path: '/pages/services', title: 'Services', type: 'link' },
				
				{ path: '/switcher/switcher', title: 'Switcher', type: 'external' },
				{ path: '/pages/terms', title: 'Terms', type: 'link' },
				{ path: '/pages/faqs', title: 'FAQS', type: 'link' },
				{ path: '/pages/pricing', title: 'Pricing', type: 'link' },
				{
					title: 'Blog', type: 'sub', Menusub: true, active: false, children: [
						{ path: '/pages/blog/blog', title: 'Blog', type: 'link' },
						{ path: '/pages/blog/blog-details', title: 'Blog Details', type: 'link' },
						{ path: '/pages/blog/edit-post', title: 'Edit Post', type: 'link' },
					]
				},
			]
		},
		{
			title: 'Utilities', icon: 'clock', type: 'sub', Menusub: true, active: false, children: [
				{ path: '/utilities/background', title: 'Background', type: 'link' },
				{ path: '/utilities/border', title: 'Border', type: 'link' },
				{ path: '/utilities/display', title: 'Display', type: 'link' },
				{ path: '/utilities/flex', title: 'Flex', type: 'link' },
				{ path: '/utilities/height', title: 'Height', type: 'link' },
				{ path: '/utilities/margin', title: 'Margin', type: 'link' },
				{ path: '/utilities/padding', title: 'Padding', type: 'link' },
				{ path: '/utilities/position', title: 'Position', type: 'link' },
				{ path: '/utilities/width', title: 'Width', type: 'link' },
				{ path: '/utilities/opacity', title: 'Opacity', type: 'link' },
				{ path: '/utilities/empty-page', title: 'Empty Page', type: 'link' },
			]
		}		
	];


	// Array
	
	//items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
	items = new BehaviorSubject<Menu[]>(this.MENUITEMS);

	// Windows width
	@HostListener("window:resize", ["$event"])
	onResize(event?) {
	 // this.screenWidth = window.innerWidth;
	}
}
