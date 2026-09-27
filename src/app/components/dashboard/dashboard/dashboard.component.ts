import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuService } from 'src/app/shared/services/menu.service';
import { AuthService } from 'src/app/shared/services/firebase/auth.service';
import { FALLBACK_THEMES, IconPath, MENU_ICONS, MENU_RULES, MenuTheme, THEMES } from './menu-visuals';

// One node of the permitted menu tree returned by Menu/GetMenusByUserId.
// Built once per load; everything the template needs is precomputed here.
export interface TileMenuNode {
  id: number;
  title: string;
  path: string | null;   // router URL (always absolute) or http(s) URL; null = no page linked
  href: string | null;   // what the anchor's href shows (base-href aware)
  external: boolean;
  paths: IconPath[];     // custom icon; empty when the backend supplies a feather icon
  feIcon: string;        // backend-supplied feather icon name (used when paths is empty)
  theme: MenuTheme;
  themeStyle: string;    // CSS custom properties for the tile, e.g. "--c1:#..;--c2:#..;--glow:.."
  parent: TileMenuNode | null;
  children: TileMenuNode[];
  pageCount: number;     // navigable pages at or below this node
  trail: string;         // ancestor titles, e.g. "Wash › Entry"
  searchKey: string;     // lower-cased "title trail" for multi-word search
}

export interface SearchHit {
  node: TileMenuNode;
  before: string;
  match: string;
  after: string;
}

const MAX_HITS = 48;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  loadingMenu = true;
  menuLoadError = false;

  rootTiles: TileMenuNode[] = [];
  current: TileMenuNode | null = null;   // section being viewed; null = start
  currentTiles: TileMenuNode[] = [];
  breadcrumbTrail: TileMenuNode[] = [];
  direction: 'in' | 'out' = 'in';        // drives the slide direction of the tiles
  totalPages = 0;

  query = '';
  hits: SearchHit[] = [];
  totalHits = 0;

  userName = '';
  greeting = '';
  today = '';
  readonly skeletonTiles = [1, 2, 3, 4, 5, 6];
  readonly icons = MENU_ICONS;

  private index: TileMenuNode[] = [];
  private byId = new Map<number, TileMenuNode>();
  private menuSub?: Subscription;
  private paramSub?: Subscription;
  private requestedId: number | null = null;
  private removePointerListeners?: () => void;

  // Menu titles that must never appear on this landing menu, even though they
  // still exist (and still work) in the regular left sidebar. Matched
  // case/space-insensitively so "Setup Pages", "setup  pages", etc. are caught.
  private hiddenTitles: string[] = [
    'setup pages'
  ];

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private locationStrategy: LocationStrategy,
    private host: ElementRef<HTMLElement>,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') || '';
    const hour = new Date().getHours();
    this.greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    this.today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // ?menu=<id> holds the open section, so refresh and browser Back/Forward
    // move through the levels.
    this.paramSub = this.route.queryParamMap.subscribe(params => {
      const next = Number(params.get('menu')) || null;
      this.direction = this.isDeeper(next) ? 'in' : 'out';
      this.requestedId = next;
      this.applyRequestedSection();
    });
    this.loadTileMenu();
  }

  ngAfterViewInit(): void {
    this.bindTilt();
  }

  ngOnDestroy(): void {
    this.menuSub?.unsubscribe();
    this.paramSub?.unsubscribe();
    this.removePointerListeners?.();
  }

  get isAtRoot(): boolean {
    return !this.current;
  }

  get isSearching(): boolean {
    return this.query.trim().length > 0;
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  loadTileMenu(): void {
    this.loadingMenu = true;
    this.menuLoadError = false;
    this.cdr.markForCheck();

    let userId: any = this.authService.decodedToken?.nameid;
    if (!userId) {
      userId = localStorage.getItem('user_create_id');
    }

    this.menuSub?.unsubscribe();
    this.menuSub = this.menuService.GetMenusByUserId(userId).subscribe(
      (res: any) => {
        this.loadingMenu = false;
        this.rootTiles = this.buildTileTree(Array.isArray(res) ? res : []);
        this.totalPages = this.rootTiles.reduce((sum, n) => sum + n.pageCount, 0);
        this.applyRequestedSection();
      },
      () => {
        this.loadingMenu = false;
        this.menuLoadError = true;
        this.cdr.markForCheck();
      }
    );
  }

  private buildTileTree(flatList: any[]): TileMenuNode[] {
    const nodes = new Map<number, TileMenuNode>();
    const parentOf = new Map<number, number>();
    const backendIcon = new Map<number, string>();

    for (const item of flatList) {
      const id = Number(item?.menu_Id);
      if (!id || nodes.has(id)) {
        continue;
      }
      const link = this.normalizePath(item.page_link);
      nodes.set(id, {
        id,
        title: (item.menu_Name ?? '').toString().trim() || 'Untitled',
        path: link.path,
        href: link.path && !link.external ? this.locationStrategy.prepareExternalUrl(link.path) : link.path,
        external: link.external,
        paths: [],
        feIcon: '',
        theme: THEMES['ocean'],
        themeStyle: '',
        parent: null,
        children: [],
        pageCount: 0,
        trail: '',
        searchKey: ''
      });
      parentOf.set(id, Number(item.parent_Menu_Id) || 0);
      backendIcon.set(id, (item.icon ?? '').toString().trim());
    }

    const roots: TileMenuNode[] = [];
    nodes.forEach((node, id) => {
      const parent = nodes.get(parentOf.get(id) ?? 0);
      if (parent && parent !== node) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    this.index = [];
    this.byId.clear();
    const visible = roots.filter(n => !this.isHiddenTitle(n.title));
    visible.forEach((n, i) => this.finalizeNode(n, null, i, backendIcon));
    return visible;
  }

  // Depth-first so the search index keeps the backend's Priority order.
  private finalizeNode(node: TileMenuNode, parent: TileMenuNode | null, position: number,
                       backendIcon: Map<number, string>): void {
    node.parent = parent;
    node.trail = parent ? (parent.trail ? `${parent.trail} › ${parent.title}` : parent.title) : '';
    node.children = node.children.filter(c => !this.isHiddenTitle(c.title));
    const isGroup = node.children.length > 0;

    // Keyword rule first; otherwise inherit the section's colour (or cycle at
    // the top level) with a generic symbol.
    const rule = this.matchRule(node.title);
    const themeKey = rule?.theme ?? (parent ? '' : FALLBACK_THEMES[position % FALLBACK_THEMES.length]);
    node.theme = themeKey ? THEMES[themeKey] : parent!.theme;
    node.themeStyle = `--c1:${node.theme.c1};--c2:${node.theme.c2};--glow:${node.theme.glow}`;

    // Backend Icon wins when present: one of our symbol names, or a feather name.
    const fromBackend = (backendIcon.get(node.id) ?? '').replace(/^fe\s+/, '').replace(/^fe-/, '');
    if (fromBackend && MENU_ICONS[fromBackend]) {
      node.paths = MENU_ICONS[fromBackend];
    } else if (fromBackend) {
      node.feIcon = fromBackend;
    } else {
      node.paths = MENU_ICONS[rule?.icon ?? (isGroup ? (parent ? 'folder' : 'grid') : 'page')];
    }

    node.searchKey = `${node.title} ${node.trail}`.toLowerCase();
    this.index.push(node);
    this.byId.set(node.id, node);

    node.children.forEach((c, i) => this.finalizeNode(c, node, i, backendIcon));
    node.pageCount = isGroup
      ? node.children.reduce((sum, c) => sum + c.pageCount, 0)
      : (node.path ? 1 : 0);
  }

  private matchRule(title: string): { icon: string; theme: string } | undefined {
    const lower = title.toLowerCase();
    return MENU_RULES.find(r => r.keys.some(k => lower.includes(k)));
  }

  private normalizePath(raw: any): { path: string | null; external: boolean } {
    const value = (raw ?? '').toString().trim();
    if (!value || value === '#') {
      return { path: null, external: false };
    }
    if (/^https?:\/\//i.test(value)) {
      return { path: value, external: true };
    }
    return { path: value.startsWith('/') ? value : '/' + value, external: false };
  }

  private isHiddenTitle(title: string): boolean {
    const normalized = (title || '').trim().toLowerCase().replace(/\s+/g, ' ');
    return this.hiddenTitles.includes(normalized);
  }

  // ---------------------------------------------------------------------------
  // Drill-down navigation
  // ---------------------------------------------------------------------------

  // Shows the section named in ?menu= (or the start level when it is missing,
  // unknown, or no longer permitted).
  private applyRequestedSection(): void {
    if (this.loadingMenu) {
      return;
    }
    const node = this.requestedId ? this.byId.get(this.requestedId) : undefined;
    this.current = node && node.children.length ? node : null;
    this.currentTiles = this.current ? this.current.children : this.rootTiles;

    const trail: TileMenuNode[] = [];
    for (let n = this.current; n; n = n.parent) {
      trail.unshift(n);
    }
    this.breadcrumbTrail = trail;
    this.cdr.markForCheck();
  }

  // True when the requested section sits below the one on screen.
  private isDeeper(nextId: number | null): boolean {
    if (!nextId) {
      return false;
    }
    for (let n = this.byId.get(nextId)?.parent ?? null; n; n = n.parent) {
      if (n === this.current) {
        return true;
      }
    }
    return !this.current;
  }

  private goToSection(node: TileMenuNode | null): void {
    this.clearSearch();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { menu: node ? node.id : null },
      queryParamsHandling: 'merge'
    }).then(() => this.focusFirstTile());
  }

  openSection(node: TileMenuNode): void {
    this.goToSection(node);
  }

  goHome(): void {
    this.goToSection(null);
  }

  goToCrumb(index: number): void {
    this.goToSection(this.breadcrumbTrail[index] ?? null);
  }

  goBack(): void {
    this.goToSection(this.current?.parent ?? null);
  }

  private focusFirstTile(): void {
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>('.tile-card:not(.is-disabled)')?.focus());
  }

  // Page tiles carry a real href so middle-click / "open in new tab" work;
  // a plain left click is routed in-app, the same way routerLink does it.
  onPageClick(event: MouseEvent, node: TileMenuNode): void {
    if (!node.path) {
      event.preventDefault();
      return;
    }
    const newTab = event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
    if (node.external || newTab) {
      return;
    }
    event.preventDefault();
    this.router.navigateByUrl(node.path);
  }

  // ---------------------------------------------------------------------------
  // Tilt + spotlight: pointer tracking runs outside Angular (no change
  // detection per mouse move) and only writes CSS variables on the tile.
  // ---------------------------------------------------------------------------

  private bindTilt(): void {
    const finePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) {
      return;
    }
    const hostEl = this.host.nativeElement;
    let active: HTMLElement | null = null;
    let frame = 0;

    const reset = (el: HTMLElement | null) => {
      el?.style.removeProperty('--rx');
      el?.style.removeProperty('--ry');
    };
    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.tile-card:not(.is-disabled):not(.tile-skeleton)');
      if (card !== active) {
        reset(active);
        active = card;
      }
      if (!card) {
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        card.style.setProperty('--rx', `${((0.5 - y) * 7).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      reset(active);
      active = null;
    };

    this.zone.runOutsideAngular(() => {
      hostEl.addEventListener('pointermove', onMove, { passive: true });
      hostEl.addEventListener('pointerleave', onLeave);
    });
    this.removePointerListeners = () => {
      cancelAnimationFrame(frame);
      hostEl.removeEventListener('pointermove', onMove);
      hostEl.removeEventListener('pointerleave', onLeave);
    };
  }

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  onSearch(value: string): void {
    this.query = value;
    const q = value.trim().toLowerCase();
    if (!q) {
      this.hits = [];
      this.totalHits = 0;
      return;
    }

    // Whole phrase in the title first (prefix, then anywhere); multi-word
    // queries also match across the path, e.g. "qc report".
    const tokens = q.split(/\s+/);
    const matches: { node: TileMenuNode; rank: number }[] = [];
    for (const node of this.index) {
      const at = node.title.toLowerCase().indexOf(q);
      if (at >= 0) {
        matches.push({ node, rank: at === 0 ? 0 : 1 });
      } else if (tokens.length > 1 && tokens.every(t => node.searchKey.includes(t))) {
        matches.push({ node, rank: 2 });
      }
    }
    // Pages before sections within a rank; Array.sort is stable so Priority order holds.
    matches.sort((a, b) =>
      a.rank - b.rank || (a.node.children.length ? 1 : 0) - (b.node.children.length ? 1 : 0));

    this.direction = 'in';
    this.totalHits = matches.length;
    this.hits = matches.slice(0, MAX_HITS).map(m => this.toHit(m.node, q, tokens));
  }

  private toHit(node: TileMenuNode, q: string, tokens: string[]): SearchHit {
    const lower = node.title.toLowerCase();
    let at = lower.indexOf(q);
    let len = q.length;
    if (at < 0) {
      const token = tokens
        .filter(t => lower.includes(t))
        .sort((a, b) => b.length - a.length)[0];
      at = token ? lower.indexOf(token) : -1;
      len = token ? token.length : 0;
    }
    if (at < 0) {
      return { node, before: node.title, match: '', after: '' };
    }
    return {
      node,
      before: node.title.slice(0, at),
      match: node.title.slice(at, at + len),
      after: node.title.slice(at + len)
    };
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.query) {
        this.clearSearch();
      } else {
        this.searchInput?.nativeElement.blur();
      }
    } else if (event.key === 'Enter' && this.hits.length) {
      event.preventDefault();
      const first = this.hits[0].node;
      if (first.children.length) {
        this.openSection(first);
      } else if (first.path) {
        if (first.external) {
          window.open(first.path, '_blank', 'noopener');
        } else {
          this.router.navigateByUrl(first.path);
        }
      }
    } else if (event.key === 'ArrowDown' && this.hits.length) {
      event.preventDefault();
      this.focusFirstTile();
    }
  }

  clearSearch(): void {
    this.onSearch('');
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  clearSearchAndFocus(): void {
    this.clearSearch();
    this.searchInput?.nativeElement.focus();
  }

  // "/" or Ctrl/Cmd+K focuses the search; Escape outside the search goes up a level.
  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = !!target && (
      target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    const isShortcut = (event.key === 'k' || event.key === 'K') && (event.ctrlKey || event.metaKey);
    if (isShortcut || (event.key === '/' && !typing)) {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
      this.searchInput?.nativeElement.select();
    } else if (event.key === 'Escape' && !typing && !document.querySelector('.modal.show')) {
      if (this.isSearching) {
        this.clearSearch();
      } else if (!this.isAtRoot) {
        this.goBack();
      }
    }
  }

  // Arrow keys move between tiles in reading order.
  onGridKeydown(event: KeyboardEvent): void {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }
    const tiles = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('.tile-card:not(.is-disabled)'));
    const current = tiles.indexOf(document.activeElement as HTMLElement);
    if (current < 0 || !tiles.length) {
      return;
    }
    event.preventDefault();

    // Tiles per row, measured from the grid cells (untransformed, unlike the
    // tilting cards) so it follows the responsive layout.
    const rowOf = (t: HTMLElement) => t.parentElement?.offsetTop ?? 0;
    const top = rowOf(tiles[0]);
    const perRow = Math.max(1, tiles.filter(t => rowOf(t) === top).length);
    const moves: { [key: string]: number } = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      ArrowDown: current + perRow,
      ArrowUp: current - perRow,
      Home: 0,
      End: tiles.length - 1
    };
    const next = Math.min(tiles.length - 1, Math.max(0, moves[event.key]));
    tiles[next].focus();
  }

  // ---------------------------------------------------------------------------
  // Template helpers
  // ---------------------------------------------------------------------------

  trackById(_: number, node: TileMenuNode): number {
    return node.id;
  }

  trackByHit(_: number, hit: SearchHit): number {
    return hit.node.id;
  }
}
