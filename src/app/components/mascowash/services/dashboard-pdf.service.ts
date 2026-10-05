import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { jsPDF } from 'jspdf';
import autoTable, { CellDef, CellHookData, RowInput } from 'jspdf-autotable';

export type PdfAlign = 'left' | 'center' | 'right';

/** One grid column, in on-screen order. */
export interface PdfColumn {
  header: string;
  /** Body alignment - text left, codes/dates center, quantities right. Default 'left'. */
  align?: PdfAlign;
  /** Optional 2nd-level header: consecutive columns with the same group get one spanning header cell above them. */
  group?: string;
  /** Text tint mirroring the grid's highlighted columns (cumulative = blue, balance = green). */
  tone?: 'cumulative' | 'balance';
  /** Minimum width in mm, for columns that must never wrap (dates, percents). */
  minWidth?: number;
}

/** A plain value, or a spanning cell (used for the "Sub Total:" / "Grand Total:" label). */
export type PdfCell =
  | string | number | null | undefined
  | { content: string | number | null | undefined; colSpan?: number; align?: PdfAlign };

export interface PdfRow {
  cells: PdfCell[];
  kind?: 'data' | 'subtotal';
}

export interface PdfMeta {
  label: string;
  value: string | null | undefined;
}

export interface DashboardPdfOptions {
  /** Report title, e.g. "Date-wise Balance Dashboard". */
  title: string;
  /** Second title line, e.g. "Garments (Pcs)". */
  subtitle?: string;
  /** Company line in the letterhead - the selected Unit. */
  company?: string;
  /** Filter strip under the letterhead; entries with an empty value are skipped. */
  meta: PdfMeta[];
  columns: PdfColumn[];
  rows: PdfRow[];
  /** Grand Total row(s), printed once at the end of the table. */
  footRows?: PdfCell[][];
  /** File name without extension; a timestamp is appended. */
  fileName: string;
}

type Rgb = [number, number, number];

const NAVY: Rgb = [44, 62, 107];
const NAVY_DARK: Rgb = [30, 45, 82];
const INK: Rgb = [33, 37, 41];
const MUTED: Rgb = [108, 117, 125];
const GRID_LINE: Rgb = [200, 205, 215];
const ZEBRA: Rgb = [246, 248, 252];
const STRIP: Rgb = [242, 245, 250];
const SUBTOTAL_FILL: Rgb = [226, 232, 243];
const CUMULATIVE_INK: Rgb = [13, 71, 161];
const BALANCE_INK: Rgb = [27, 94, 32];

const MARGIN = 10;
/** Space between a filter label and its value (jsPDF drops trailing spaces from measured text). */
const LABEL_GAP = 1.4;
const LOGO_URL = 'assets/images/MascoLogo.png';

/**
 * Shared PDF export for the Wash dashboards (jsPDF + jspdf-autotable).
 *
 * Every page gets the same letterhead (logo, Unit, title, printed on/by), the
 * filter strip, a repeated navy column header and a "Page x of y" footer. Sub
 * Total rows are shaded and bold; the Grand Total prints once, on the last
 * page. Page size follows the column count so wide grids stay readable:
 * A4 landscape up to 14 columns, A3 landscape beyond that.
 */
@Injectable({ providedIn: 'root' })
export class DashboardPdfService {

  private logoDataUrl: string | null | undefined;

  async export(opts: DashboardPdfOptions): Promise<void> {
    const columnCount = opts.columns.length;
    const format = columnCount > 14 ? 'a3' : 'a4';
    const fontSize = columnCount <= 10 ? 8 : columnCount <= 16 ? 7 : columnCount <= 22 ? 6.6 : 6.2;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format, compress: true });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const logo = await this.loadLogo();

    const now = new Date();
    const printedOn = formatDate(now, 'd MMM yyyy, h:mm a', 'en-US');
    const printedBy = this.readUserName();

    const recordCount = opts.rows.filter(r => r.kind !== 'subtotal').length;
    const meta = [
      ...opts.meta.filter(m => m.value !== null && m.value !== undefined && String(m.value).trim() !== ''),
      { label: 'Records', value: recordCount.toLocaleString('en-US') }
    ] as { label: string; value: string }[];

    const metaLines = this.layoutMeta(doc, meta, pageW - 2 * MARGIN - 8);
    const letterheadBottom = 27;
    const stripH = metaLines.length * 4.6 + 3.2;
    const tableTop = letterheadBottom + stripH + 3;

    const drawPageChrome = () => {
      this.drawLetterhead(doc, pageW, logo, opts, printedOn, printedBy);
      this.drawMetaStrip(doc, pageW, letterheadBottom, stripH, metaLines);
    };

    const kinds = opts.rows.map(r => r.kind ?? 'data');
    const columnStyles: { [key: number]: any } = {};
    opts.columns.forEach((c, i) => {
      columnStyles[i] = { halign: c.align ?? 'left' };
      if (c.minWidth) columnStyles[i].minCellWidth = c.minWidth;
      if (c.tone) columnStyles[i].textColor = c.tone === 'cumulative' ? CUMULATIVE_INK : BALANCE_INK;
    });

    autoTable(doc, {
      head: this.buildHead(opts.columns),
      body: opts.rows.map(r => this.toRow(r.cells)),
      foot: opts.footRows?.length ? opts.footRows.map(cells => this.toRow(cells)) : undefined,
      showHead: 'everyPage',
      showFoot: 'lastPage',
      theme: 'grid',
      startY: tableTop,
      margin: { top: tableTop, left: MARGIN, right: MARGIN, bottom: 14 },
      tableWidth: 'auto',
      rowPageBreak: 'avoid',
      styles: {
        font: 'helvetica',
        fontSize,
        textColor: INK,
        lineColor: GRID_LINE,
        lineWidth: 0.15,
        cellPadding: { top: 1.3, bottom: 1.3, left: 1.2, right: 1.2 },
        valign: 'middle',
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: NAVY,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineColor: NAVY_DARK,
        lineWidth: 0.2
      },
      footStyles: {
        fillColor: NAVY_DARK,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        lineColor: NAVY_DARK,
        lineWidth: 0.2
      },
      alternateRowStyles: { fillColor: ZEBRA },
      columnStyles,
      didParseCell: (d: CellHookData) => {
        const raw: any = d.cell.raw;
        const ownAlign = raw && typeof raw === 'object' && raw.styles?.halign;
        if (d.section === 'body' && kinds[d.row.index] === 'subtotal') {
          d.cell.styles.fillColor = SUBTOTAL_FILL;
          d.cell.styles.fontStyle = 'bold';
          if (!opts.columns[d.column.index]?.tone) d.cell.styles.textColor = [17, 24, 39];
        }
        if (d.section === 'foot' && !ownAlign) {
          d.cell.styles.halign = opts.columns[d.column.index]?.align ?? 'left';
        }
      },
      didDrawPage: () => drawPageChrome()
    });

    // Footers last, once the total page count is known.
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      this.drawFooter(doc, pageW, pageH, opts.title, p, pageCount);
    }

    const stamp = formatDate(now, 'yyyyMMdd_HHmm', 'en-US');
    doc.save(`${opts.fileName}_${stamp}.pdf`);
  }

  // ---------------------------------------------------------------------------
  // Table helpers
  // ---------------------------------------------------------------------------

  /** One header row, or two when some columns carry a group (group cell spans, the rest span both rows). */
  private buildHead(columns: PdfColumn[]): RowInput[] {
    if (!columns.some(c => c.group)) {
      return [columns.map(c => c.header)];
    }
    const top: CellDef[] = [];
    const bottom: CellDef[] = [];
    let i = 0;
    while (i < columns.length) {
      const group = columns[i].group;
      if (!group) {
        top.push({ content: columns[i].header, rowSpan: 2 });
        i++;
        continue;
      }
      let j = i;
      while (j < columns.length && columns[j].group === group) {
        bottom.push({ content: columns[j].header });
        j++;
      }
      top.push({ content: group, colSpan: j - i });
      i = j;
    }
    return [top, bottom];
  }

  private toRow(cells: PdfCell[]): CellDef[] {
    return cells.map(c => {
      if (c !== null && typeof c === 'object') {
        const def: CellDef = { content: this.text(c.content) };
        if (c.colSpan && c.colSpan > 1) def.colSpan = c.colSpan;
        if (c.align) def.styles = { halign: c.align };
        return def;
      }
      return { content: this.text(c) };
    });
  }

  private text(v: string | number | null | undefined): string {
    if (v === null || v === undefined) return '';
    return typeof v === 'number' ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : String(v);
  }

  // ---------------------------------------------------------------------------
  // Page chrome
  // ---------------------------------------------------------------------------

  private drawLetterhead(doc: jsPDF, pageW: number, logo: string | null,
                         opts: DashboardPdfOptions, printedOn: string, printedBy: string): void {
    const top = 8;
    let leftX = MARGIN;

    if (logo) {
      doc.addImage(logo, 'PNG', MARGIN, top, 11.5, 15);
      leftX = MARGIN + 15;
    }

    // Left: company block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...NAVY);
    const company = opts.company || 'MASCO Group';
    doc.text(company, leftX, top + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Wash Management System', leftX, top + 10.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const leftW = leftX - MARGIN + Math.max(doc.getTextWidth(company), 35);

    // Right: printed on / by
    const rightX = pageW - MARGIN;
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(`Printed on: ${printedOn}`, rightX, top + 5.5, { align: 'right' });
    if (printedBy) doc.text(`Printed by: ${printedBy}`, rightX, top + 10.5, { align: 'right' });
    const rightW = Math.max(doc.getTextWidth(`Printed on: ${printedOn}`), printedBy ? doc.getTextWidth(`Printed by: ${printedBy}`) : 0);

    // Centre: title (shrinks if it would collide with either side block)
    const room = pageW - 2 * MARGIN - 2 * Math.max(leftW, rightW) - 8;
    let titleSize = 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(titleSize);
    while (titleSize > 10 && doc.getTextWidth(opts.title) > room) {
      titleSize -= 0.5;
      doc.setFontSize(titleSize);
    }
    doc.setTextColor(...NAVY_DARK);
    doc.text(opts.title, pageW / 2, top + 6, { align: 'center' });
    if (opts.subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(opts.subtitle, pageW / 2, top + 11.5, { align: 'center' });
    }

    // Double rule under the letterhead
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, top + 16, pageW - MARGIN, top + 16);
    doc.setDrawColor(...GRID_LINE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, top + 17.1, pageW - MARGIN, top + 17.1);
  }

  /** Greedy wrap of "Label: value" chips into lines that fit the strip width. */
  private layoutMeta(doc: jsPDF, meta: { label: string; value: string }[], maxW: number):
    { label: string; value: string; x: number }[][] {
    const gap = 9;
    const lines: { label: string; value: string; x: number }[][] = [[]];
    let x = 0;
    doc.setFontSize(7.8);
    for (const m of meta) {
      doc.setFont('helvetica', 'bold');
      const lw = doc.getTextWidth(`${m.label}:`) + LABEL_GAP;
      doc.setFont('helvetica', 'normal');
      const w = lw + doc.getTextWidth(m.value);
      if (x > 0 && x + w > maxW) {
        lines.push([]);
        x = 0;
      }
      lines[lines.length - 1].push({ ...m, x });
      x += w + gap;
    }
    return lines;
  }

  private drawMetaStrip(doc: jsPDF, pageW: number, y: number, h: number,
                        lines: { label: string; value: string; x: number }[][]): void {
    doc.setFillColor(...STRIP);
    doc.setDrawColor(...GRID_LINE);
    doc.setLineWidth(0.2);
    doc.roundedRect(MARGIN, y, pageW - 2 * MARGIN, h, 1.2, 1.2, 'FD');
    // Accent bar on the left edge of the strip
    doc.setFillColor(...NAVY);
    doc.rect(MARGIN, y, 1.2, h, 'F');

    doc.setFontSize(7.8);
    lines.forEach((line, li) => {
      const baseY = y + 4.6 + li * 4.6;
      for (const item of line) {
        const x = MARGIN + 4 + item.x;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...MUTED);
        const label = `${item.label}:`;
        doc.text(label, x, baseY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...INK);
        doc.text(item.value, x + doc.getTextWidth(label) + LABEL_GAP, baseY);
      }
    });
  }

  private drawFooter(doc: jsPDF, pageW: number, pageH: number, title: string, page: number, pages: number): void {
    const y = pageH - 7;
    doc.setDrawColor(...GRID_LINE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y - 3.5, pageW - MARGIN, y - 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`MASCO Wash Management System  |  ${title}`, MARGIN, y);
    doc.text('System generated report', pageW / 2, y, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${page} of ${pages}`, pageW - MARGIN, y, { align: 'right' });
  }

  // ---------------------------------------------------------------------------
  // Assets
  // ---------------------------------------------------------------------------

  /** Logo as a data URL, fetched once per session; null when it can't be loaded (PDF still exports). */
  private async loadLogo(): Promise<string | null> {
    if (this.logoDataUrl !== undefined) return this.logoDataUrl;
    try {
      const res = await fetch(LOGO_URL);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      this.logoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch {
      this.logoDataUrl = null;
    }
    return this.logoDataUrl;
  }

  private readUserName(): string {
    try {
      return (localStorage.getItem('userName') || '').trim();
    } catch {
      return '';
    }
  }
}
