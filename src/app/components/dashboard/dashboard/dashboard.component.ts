import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from 'src/app/shared/services/menu.service';
import { AuthService } from 'src/app/shared/services/firebase/auth.service';

export interface TileMenuNode {
  id: number;
  title: string;
  path?: string;
  icon: string;
  gradient: string;
  accent: string;
  children: TileMenuNode[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // Tile (flat) menu state
  loadingMenu = true;
  menuLoadError = false;
  rootTiles: TileMenuNode[] = [];
  currentTiles: TileMenuNode[] = [];
  breadcrumbTrail: TileMenuNode[] = [];

  // Icon keyword map -> feather icon class (used across the rest of the app: "fe fe-xxx")
  private iconMap: { keys: string[]; icon: string }[] = [
    { keys: ['social'], icon: 'users' },
    { keys: ['environment'], icon: 'globe' },
    { keys: ['material'], icon: 'package' },
    { keys: ['dashboard', 'report', 'summary'], icon: 'bar-chart-2' },
    { keys: ['entry', 'data entry', 'add'], icon: 'edit-3' },
    { keys: ['marking'], icon: 'tag' },
    { keys: ['bsci'], icon: 'shield' },
    { keys: ['leed'], icon: 'award' },
    { keys: ['sedex'], icon: 'check-circle' },
    { keys: ['ics'], icon: 'clipboard' },
    { keys: ['betterwork', 'better work'], icon: 'briefcase' },
    { keys: ['setup', 'settings', 'configuration'], icon: 'settings' },
    { keys: ['user', 'admin', 'role'], icon: 'user' },
    { keys: ['wash'], icon: 'droplet' },
    { keys: ['machine', 'plan'], icon: 'cpu' },
    { keys: ['order'], icon: 'shopping-bag' },
    { keys: ['rejection', 'reject'], icon: 'alert-triangle' },
    { keys: ['balance'], icon: 'trending-up' },
    { keys: ['invoice', 'lc'], icon: 'file-text' },
  ];

  // Menu titles that must never appear as a tile on this flat menu, even
  // though they still exist (and still work) in the regular left sidebar.
  // Matched case/space-insensitively so "Setup Pages", "setup  pages", etc.
  // are all caught.
  private hiddenTitles: string[] = [
    'setup pages'
  ];

  // A modern, professional palette: each entry pairs a soft pastel background
  // with a punchy accent color for the icon, so every tile reads as distinct
  // yet part of one cohesive, elegant set.
  private palette: { gradient: string; accent: string }[] = [
    { gradient: 'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 100%)', accent: '#4f46e5' }, // indigo
    { gradient: 'linear-gradient(145deg, #ecfeff 0%, #cffafe 100%)', accent: '#0891b2' }, // cyan
    { gradient: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)', accent: '#ea580c' }, // orange
    { gradient: 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)', accent: '#059669' }, // emerald
    { gradient: 'linear-gradient(145deg, #fdf2f8 0%, #fce7f3 100%)', accent: '#db2777' }, // pink
    { gradient: 'linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)', accent: '#7c3aed' }, // violet
    { gradient: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)', accent: '#2563eb' }, // blue
    { gradient: 'linear-gradient(145deg, #fefce8 0%, #fef9c3 100%)', accent: '#ca8a04' }, // amber
  ];

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTileMenu();
  }

  get isAtRoot(): boolean {
    return this.breadcrumbTrail.length === 0;
  }

  get sectionTitle(): string {
    return this.breadcrumbTrail.length
      ? this.breadcrumbTrail[this.breadcrumbTrail.length - 1].title
      : '';
  }

  loadTileMenu(): void {
    this.loadingMenu = true;
    this.menuLoadError = false;

    let userId: any = this.authService.decodedToken?.nameid;
    if (!userId) {
      userId = localStorage.getItem('user_create_id');
    }

    this.menuService.GetMenusByUserId(userId).subscribe(
      (res: any) => {
        this.loadingMenu = false;
        const flatList = res || [];
        this.rootTiles = this.buildTileTree(flatList);
        this.currentTiles = this.rootTiles;
        this.breadcrumbTrail = [];
      },
      () => {
        this.loadingMenu = false;
        this.menuLoadError = true;
      }
    );
  }

  private buildTileTree(flatList: any[]): TileMenuNode[] {
    let colorIndex = 0;

    const mapNode = (item: any): TileMenuNode => {
      const colors = this.palette[colorIndex % this.palette.length];
      const node: TileMenuNode = {
        id: item.menu_Id,
        title: item.menu_Name,
        path: item.page_link,
        icon: this.resolveIcon(item.menu_Name),
        gradient: colors.gradient,
        accent: colors.accent,
        children: []
      };
      colorIndex++;
      return node;
    };

    const nodesById: { [id: number]: TileMenuNode } = {};
    flatList.forEach((item: any) => {
      nodesById[item.menu_Id] = mapNode(item);
    });

    const roots: TileMenuNode[] = [];
    flatList.forEach((item: any) => {
      const node = nodesById[item.menu_Id];
      const parentId = item.parent_Menu_Id;
      if (parentId && parentId !== 0 && nodesById[parentId]) {
        nodesById[parentId].children.push(node);
      } else {
        roots.push(node);
      }
    });

    return this.filterHiddenNodes(roots);
  }

  // Removes any tile (at any depth) whose title is on the hidden list.
  // Purely a display filter for this tile menu - it does not touch the
  // underlying menu/permission data used by the left sidebar.
  private filterHiddenNodes(nodes: TileMenuNode[]): TileMenuNode[] {
    return nodes
      .filter(n => !this.isHiddenTitle(n.title))
      .map(n => ({ ...n, children: this.filterHiddenNodes(n.children) }));
  }

  private isHiddenTitle(title: string): boolean {
    const normalized = (title || '').trim().toLowerCase().replace(/\s+/g, ' ');
    return this.hiddenTitles.includes(normalized);
  }

  private resolveIcon(title: string): string {
    const lowerTitle = (title || '').toLowerCase();
    for (const entry of this.iconMap) {
      if (entry.keys.some(k => lowerTitle.includes(k))) {
        return entry.icon;
      }
    }
    return 'grid';
  }

  openTile(node: TileMenuNode): void {
    if (node.children && node.children.length > 0) {
      this.breadcrumbTrail.push(node);
      this.currentTiles = node.children;
      return;
    }
    if (node.path) {
      this.router.navigate([node.path]);
    }
  }

  goHome(): void {
    this.breadcrumbTrail = [];
    this.currentTiles = this.rootTiles;
  }

  goToCrumb(index: number): void {
    this.breadcrumbTrail = this.breadcrumbTrail.slice(0, index + 1);
    this.currentTiles = this.breadcrumbTrail[index].children;
  }

  goBack(): void {
    if (this.breadcrumbTrail.length === 0) {
      return;
    }
    this.breadcrumbTrail.pop();
    this.currentTiles = this.breadcrumbTrail.length
      ? this.breadcrumbTrail[this.breadcrumbTrail.length - 1].children
      : this.rootTiles;
  }
}
