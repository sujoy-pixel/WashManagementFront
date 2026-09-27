// Visual identity for the landing tile menu: a small duotone icon set drawn for
// the wash domain, and gradient themes. Menu rows from the backend carry no
// icon, so both are chosen from keywords in the menu title (see MENU_RULES).

export interface IconPath {
  d: string;
  duo?: boolean;   // soft filled layer (no stroke)
}

export interface MenuTheme {
  c1: string;      // gradient start
  c2: string;      // gradient end
  glow: string;    // "r, g, b" for rgba() glows and tints
}

// Same outline drawn as a soft fill plus a crisp stroke.
const duo = (d: string): IconPath[] => [{ d, duo: true }, { d }];
const line = (...ds: string[]): IconPath[] => ds.map(d => ({ d }));
const circle = (cx: number, cy: number, r: number): string =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const MENU_ICONS: { [key: string]: IconPath[] } = {
  wash: [
    ...duo('M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'),
    ...line('M3 8h18', 'M6.5 5.5h.01', 'M9.5 5.5h.01', circle(12, 14, 4)),
    { d: 'M8.4 15.4c1.2-.9 2.4-.9 3.6 0s2.4.9 3.6 0a4 4 0 0 1-7.2 0z', duo: true },
  ],
  droplet: [
    ...duo('M12 3.5c3 3.6 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.9 6-10.5z'),
    ...line('M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5'),
  ],
  qc: [
    ...duo('M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6l7-3z'),
    ...line('M9 12l2 2 4-4'),
  ],
  inspect: [
    ...duo(circle(11, 11, 7)),
    ...line('M20 20l-4-4', 'M8.5 11l1.8 1.8 3.2-3.3'),
  ],
  report: [
    ...duo('M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'),
    ...line('M14 3v5h5', 'M9 17v-3', 'M12 17v-5', 'M15 17v-2'),
  ],
  time: [
    ...duo(circle(12, 12, 9)),
    ...line('M12 7v5l3 2'),
  ],
  dashboard: [
    { d: 'M4 16a8 8 0 0 1 16 0z', duo: true },
    ...line('M4 16a8 8 0 1 1 16 0', 'M12 16l3.5-4.5', circle(12, 16, 1), 'M4 19.5h16'),
  ],
  chart: [
    ...duo('M6 11h3v9H6z'), ...duo('M11 6h3v14h-3z'), ...duo('M16 14h3v6h-3z'),
    ...line('M4 20h16'),
  ],
  batch: [
    ...duo('M12 3l9 5-9 5-9-5 9-5z'),
    ...line('M3 12.5l9 5 9-5', 'M3 17l9 5 9-5'),
  ],
  machine: [
    ...duo(circle(12, 12, 5)),
    ...line(circle(12, 12, 2), 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3',
      'M4.9 4.9L7 7', 'M17 17l2.1 2.1', 'M4.9 19.1L7 17', 'M17 7l2.1-2.1'),
  ],
  plan: [
    { d: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3H3z', duo: true },
    ...line('M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
      'M3 10h18', 'M8 3v4', 'M16 3v4', 'M9 15l2 2 4-4'),
  ],
  receive: [
    ...duo('M3 13h5l1.5 3h5l1.5-3h5v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'),
    ...line('M12 3v9', 'M8.5 8.5L12 12l3.5-3.5'),
  ],
  deliver: [
    ...duo('M2 6h11v10H2z'),
    ...line('M13 9h4l3 3.5V16h-7', circle(7, 18, 2), circle(17, 18, 2)),
  ],
  shade: [
    ...duo('M12 3a9 9 0 0 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z'),
    ...line('M7.5 11.5h.01', 'M9.5 7.5h.01', 'M14.5 7.5h.01', 'M17 11h.01'),
  ],
  priority: [
    ...duo('M5 4h11l-2 4 2 4H5'),
    ...line('M5 21V4'),
  ],
  floor: [
    ...duo('M3 21V11l6 3.5V11l6 3.5V5h3.5L21 7v14z'),
    ...line('M7 17.5h1.5', 'M11.5 17.5H13', 'M16 17.5h1.5'),
  ],
  operation: [
    ...duo(circle(12, 12, 9)),
    ...line('M10 8.5l5 3.5-5 3.5z'),
  ],
  reject: [
    ...duo('M12 3.5l9.5 16.5h-19z'),
    ...line('M12 10v4', 'M12 17h.01'),
  ],
  settings: [
    ...line('M4 7h9', 'M17 7h3', 'M4 17h3', 'M11 17h9'),
    ...duo(circle(15, 7, 2)), ...duo(circle(9, 17, 2)),
  ],
  users: [
    ...duo(circle(9, 8, 3)),
    ...line('M3 20a6 6 0 0 1 12 0', 'M16 5a3 3 0 0 1 0 6', 'M18 14.5a5.5 5.5 0 0 1 3 5.5'),
  ],
  entry: [
    ...line('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7'),
    ...duo('M18.5 2.5a2.1 2.1 0 0 1 3 3L13 14l-4 1 1-4z'),
  ],
  balance: [
    ...line('M12 3v18', 'M7 21h10', 'M5 7h14'),
    ...duo('M5 7l-3 6a3 3 0 0 0 6 0z'), ...duo('M19 7l-3 6a3 3 0 0 0 6 0z'),
  ],
  style: [
    ...line('M10 5a2 2 0 1 1 2 2v2'),
    ...duo('M12 9l8.6 6.2a1 1 0 0 1-.6 1.8H4a1 1 0 0 1-.6-1.8z'),
  ],
  order: [
    ...line('M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2', 'M8 12h8', 'M8 16h5'),
    ...duo('M9 2h6v4H9z'),
  ],
  acid: [
    { d: 'M7.2 15h9.6l2 3.5a1 1 0 0 1-.9 1.5H6.1a1 1 0 0 1-.9-1.5z', duo: true },
    ...line('M9 3h6', 'M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3'),
  ],
  rewash: [
    ...line('M20 11a8 8 0 0 0-14.9-3.9', 'M4 13a8 8 0 0 0 14.9 3.9', 'M20 4v5h-5', 'M4 20v-5h5'),
  ],
  grid: [
    ...duo('M4 4h6v6H4z'), ...line('M14 4h6v6h-6z', 'M4 14h6v6H4z'), ...duo('M14 14h6v6h-6z'),
  ],
  folder: [
    ...duo('M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'),
  ],
  page: [
    ...duo('M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'),
    ...line('M14 3v5h5', 'M9 13h6', 'M9 17h4'),
  ],
  lock: [
    ...duo('M5 11h14v10H5z'),
    ...line('M8 11V7a4 4 0 0 1 8 0v4', 'M12 15v2'),
  ],
  search: [
    ...duo(circle(11, 11, 7)),
    ...line('M20 20l-4-4'),
  ],
  offline: [
    ...line('M2 8.8a15 15 0 0 1 20 0', 'M5 12.5a10 10 0 0 1 14 0', 'M8.5 16a5 5 0 0 1 7 0', 'M12 19.5h.01', 'M3 3l18 18'),
  ],
};

export const THEMES: { [key: string]: MenuTheme } = {
  ocean: { c1: '#0ea5e9', c2: '#2563eb', glow: '14, 165, 233' },
  emerald: { c1: '#10b981', c2: '#0d9488', glow: '16, 185, 129' },
  violet: { c1: '#a855f7', c2: '#6366f1', glow: '139, 92, 246' },
  sunset: { c1: '#fb923c', c2: '#f43f5e', glow: '249, 115, 22' },
  amber: { c1: '#fbbf24', c2: '#f97316', glow: '245, 158, 11' },
  rose: { c1: '#fb7185', c2: '#e11d48', glow: '244, 63, 94' },
  indigo: { c1: '#818cf8', c2: '#4f46e5', glow: '99, 102, 241' },
  teal: { c1: '#2dd4bf', c2: '#0891b2', glow: '20, 184, 166' },
  fuchsia: { c1: '#e879f9', c2: '#9333ea', glow: '217, 70, 239' },
  slate: { c1: '#64748b', c2: '#1e293b', glow: '71, 85, 105' },
};

// Cycled for modules whose title matches no rule, so top-level tiles differ.
export const FALLBACK_THEMES = ['ocean', 'violet', 'emerald', 'sunset', 'indigo', 'teal', 'fuchsia', 'amber'];

// First match wins, so more specific words come first
// (e.g. "Batch Wise Shade Status" is a shade screen, "Wash Item Delivery" a delivery one).
export const MENU_RULES: { keys: string[]; icon: string; theme: string }[] = [
  { keys: ['dashboard'], icon: 'dashboard', theme: 'violet' },
  { keys: ['hourly'], icon: 'time', theme: 'amber' },
  { keys: ['report', 'summary'], icon: 'report', theme: 'amber' },
  { keys: ['reject', 'fault', 'defect'], icon: 'reject', theme: 'rose' },
  { keys: ['shade'], icon: 'shade', theme: 'fuchsia' },
  { keys: ['priority'], icon: 'priority', theme: 'sunset' },
  { keys: ['acid'], icon: 'acid', theme: 'amber' },
  { keys: ['rewash', 're-wash'], icon: 'rewash', theme: 'ocean' },
  { keys: ['deliver', 'dispatch'], icon: 'deliver', theme: 'sunset' },
  { keys: ['receive'], icon: 'receive', theme: 'teal' },
  { keys: ['plan', 'schedule'], icon: 'plan', theme: 'fuchsia' },
  { keys: ['qc', 'quality', 'dhu'], icon: 'qc', theme: 'emerald' },
  { keys: ['inspection', 'inspect'], icon: 'inspect', theme: 'teal' },
  { keys: ['batch'], icon: 'batch', theme: 'indigo' },
  { keys: ['machine'], icon: 'machine', theme: 'ocean' },
  { keys: ['floor'], icon: 'floor', theme: 'indigo' },
  { keys: ['operation', 'process', 'start'], icon: 'operation', theme: 'teal' },
  { keys: ['order'], icon: 'order', theme: 'indigo' },
  { keys: ['style', 'garment'], icon: 'style', theme: 'violet' },
  { keys: ['balance'], icon: 'balance', theme: 'emerald' },
  { keys: ['setup', 'setting', 'config'], icon: 'settings', theme: 'slate' },
  { keys: ['user', 'role', 'admin', 'permission'], icon: 'users', theme: 'indigo' },
  { keys: ['entry'], icon: 'entry', theme: 'ocean' },
  { keys: ['wash'], icon: 'wash', theme: 'ocean' },
];
