import { jsPDF } from 'jspdf';
import { buildColumnBandLabels, buildRowBandLabels } from './addressing';
import { defaultParams } from './params';
import type { CsvSchemeDocument, ExportRow, ExportScene, ImportedSchemeDocument, ProjectParams } from './types';

const csvColumns: Array<keyof ExportRow> = [
  'code',
  'id',
  'cell',
  'side',
  'kind',
  'axis',
  'gridIndexA',
  'gridIndexB',
  'startX',
  'startY',
  'endX',
  'endY',
  'length',
  'visibleHeight',
  'cutWidth',
  'cutHeight',
  'visibleArea',
  'cutArea',
];

const projectParamKeys: Array<keyof ProjectParams> = [
  'N',
  'K',
  'D',
  'H',
  'P',
  'innerFabricHeight',
  'perimeterFabricHeight',
  'bendAllowancePerEdge',
];

const numericExportColumns = new Set<keyof ExportRow>([
  'gridIndexA',
  'gridIndexB',
  'startX',
  'startY',
  'endX',
  'endY',
  'length',
  'visibleHeight',
  'cutWidth',
  'cutHeight',
  'visibleArea',
  'cutArea',
]);

function triggerDownload(filename: string, mimeType: string, content: BlobPart) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

function formatNumber(value: number) {
  return value.toFixed(2);
}

function escapeCsvValue(value: string | number) {
  const stringValue = String(value);

  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replace(/"/g, '""')}"`;
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  values.push(current);
  return values;
}

function createSchemeFilename(schemeTitle: string, extension: 'csv' | 'pdf') {
  const slug = schemeTitle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug || 'labirinter-scheme'}.${extension}`;
}

function drawPlanPage(doc: jsPDF, scene: ExportScene) {
  const { geometry, params, rows, schemeTitle, summary } = scene;
  const pageWidth = doc.internal.pageSize.getWidth();
  const planLeft = 104;
  const planTop = 28;
  const planWidth = 90;
  const planHeight = 120;
  const scale = Math.min(planWidth / Math.max(geometry.width, 1), planHeight / Math.max(geometry.height, 1));
  const marginX = planLeft + (planWidth - geometry.width * scale) / 2;
  const marginY = planTop + (planHeight - geometry.height * scale) / 2;
  const columnLabels = buildColumnBandLabels(geometry.xPositions);
  const rowLabels = buildRowBandLabels(geometry.yPositions);
  const toPdfX = (x: number) => marginX + x * scale;
  const toPdfY = (y: number) => marginY + planHeight - y * scale;

  doc.setFillColor(20, 16, 12);
  doc.rect(10, 10, pageWidth - 20, 277, 'F');

  doc.setTextColor(240, 223, 184);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('LABIRINTER', 16, 24);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Fabric maze planning console', 16, 31);
  doc.setFontSize(14);
  doc.text(schemeTitle || 'Untitled scheme', 16, 39);

  doc.setDrawColor(157, 129, 84);
  doc.roundedRect(14, 48, 80, 92, 4, 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Project Parameters', 18, 57);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const parameterLines = [
    `Rows N: ${params.N}`,
    `Columns K: ${params.K}`,
    `Pole spacing D: ${formatNumber(params.D)} m`,
    `Pole height H: ${formatNumber(params.H)} m`,
    `Inner transverse lines P: ${params.P}`,
    `Grid step from P: ${formatNumber(geometry.gridStep)} m`,
    `Inner fabric height: ${formatNumber(params.innerFabricHeight)} m`,
    `Perimeter height: ${formatNumber(params.perimeterFabricHeight)} m`,
    `Bend per edge: ${formatNumber(params.bendAllowancePerEdge)} m`,
  ];

  parameterLines.forEach((line, index) => {
    doc.text(line, 18, 65 + index * 7);
  });

  doc.roundedRect(14, 146, 80, 64, 4, 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Material Summary', 18, 155);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const summaryLines = [
    `Selected walls: ${summary.selectedCount}`,
    `Interior walls: ${summary.interiorCount}`,
    `Perimeter walls: ${summary.perimeterCount}`,
    `Total wall length: ${formatNumber(summary.totalLength)} m`,
    `Visible fabric area: ${formatNumber(summary.totalVisibleArea)} m2`,
    `Cut fabric area: ${formatNumber(summary.totalCutArea)} m2`,
  ];

  summaryLines.forEach((line, index) => {
    doc.text(line, 18, 164 + index * 8);
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Plan View', 104, 20);
  doc.setDrawColor(157, 129, 84);
  doc.roundedRect(planLeft, planTop, planWidth, planHeight, 4, 4);

  doc.setDrawColor(74, 64, 51);
  doc.setLineWidth(0.18);
  geometry.yPositions.forEach((y) => {
    doc.line(toPdfX(0), toPdfY(y), toPdfX(geometry.width), toPdfY(y));
  });
  geometry.xPositions.forEach((x) => {
    doc.line(toPdfX(x), toPdfY(0), toPdfX(x), toPdfY(geometry.height));
  });

  doc.setDrawColor(129, 102, 64);
  doc.setLineWidth(0.38);
  geometry.majorYPositions.forEach((y) => {
    doc.line(toPdfX(0), toPdfY(y), toPdfX(geometry.width), toPdfY(y));
  });
  geometry.majorXPositions.forEach((x) => {
    doc.line(toPdfX(x), toPdfY(0), toPdfX(x), toPdfY(geometry.height));
  });

  doc.setDrawColor(240, 174, 67);
  doc.setLineWidth(1.2);
  rows.forEach((row) => {
    doc.line(toPdfX(row.startX), toPdfY(row.startY), toPdfX(row.endX), toPdfY(row.endY));
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.4);
  doc.setTextColor(240, 223, 184);
  columnLabels.forEach((label) => {
    doc.text(label.primary, toPdfX(label.center), planTop + planHeight + 6, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.2);
    doc.setTextColor(177, 158, 122);
    doc.text(label.metric, toPdfX(label.center), planTop + planHeight + 10, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.4);
    doc.setTextColor(240, 223, 184);
  });

  rowLabels.forEach((label) => {
    doc.text(label.primary, planLeft - 6, toPdfY(label.center) - 0.4, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(4.2);
    doc.setTextColor(177, 158, 122);
    doc.text(label.metric, planLeft - 6, toPdfY(label.center) + 3, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.4);
    doc.setTextColor(240, 223, 184);
  });
}

function drawTableHeader(doc: jsPDF, pageNumber: number, schemeTitle: string) {
  doc.setFillColor(20, 16, 12);
  doc.rect(10, 10, 190, 277, 'F');
  doc.setTextColor(240, 223, 184);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Wall Specification', 14, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(schemeTitle || 'Untitled scheme', 14, 27);
  doc.text(`Page ${pageNumber}`, 180, 20, { align: 'right' });
  doc.text('Code', 14, 36);
  doc.text('Kind', 31, 36);
  doc.text('Axis', 51, 36);
  doc.text('Start', 63, 36);
  doc.text('End', 95, 36);
  doc.text('Len', 127, 36);
  doc.text('H', 139, 36);
  doc.text('Area', 150, 36);
  doc.text('Cut', 188, 36, { align: 'right' });
  doc.setDrawColor(157, 129, 84);
  doc.line(14, 39, 190, 39);
}

function drawRowsPage(doc: jsPDF, rows: ExportRow[], pageNumber: number, schemeTitle: string) {
  drawTableHeader(doc, pageNumber, schemeTitle);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);

  rows.forEach((row, index) => {
    const y = 46 + index * 8;
    doc.text(row.code, 14, y);
    doc.text(row.kind, 31, y);
    doc.text(row.axis, 51, y);
    doc.text(`${formatNumber(row.startX)},${formatNumber(row.startY)}`, 63, y);
    doc.text(`${formatNumber(row.endX)},${formatNumber(row.endY)}`, 95, y);
    doc.text(formatNumber(row.length), 127, y);
    doc.text(formatNumber(row.visibleHeight), 139, y);
    doc.text(formatNumber(row.visibleArea), 150, y);
    doc.text(formatNumber(row.cutArea), 188, y, { align: 'right' });
  });
}

export function buildCsvContent(document: CsvSchemeDocument) {
  const metadataLines = [
    ['meta', 'version', '1'],
    ['meta', 'schemeTitle', document.schemeTitle],
    ...projectParamKeys.map((key) => ['meta', key, String(document.params[key])]),
  ];

  const header = csvColumns.join(',');
  const body = document.rows.map((row) =>
    csvColumns.map((column) => escapeCsvValue(row[column])).join(','),
  );

  return [
    ...metadataLines.map((line) => line.map((value) => escapeCsvValue(value)).join(',')),
    '',
    header,
    ...body,
  ].join('\n');
}

export function parseCsvContent(content: string): ImportedSchemeDocument {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const params: ProjectParams = { ...defaultParams };
  const rows: ExportRow[] = [];
  let schemeTitle = '';
  let headerColumns: string[] | null = null;

  lines.forEach((line) => {
    const columns = splitCsvLine(line);

    if (columns[0] === 'meta') {
      const [, rawKey, rawValue = ''] = columns;

      if (rawKey === 'schemeTitle') {
        schemeTitle = rawValue;
        return;
      }

      if (projectParamKeys.includes(rawKey as keyof ProjectParams)) {
        const key = rawKey as keyof ProjectParams;
        const nextValue = Number(rawValue);

        if (!Number.isNaN(nextValue)) {
          params[key] = nextValue;
        }
      }

      return;
    }

    if (columns[0] === 'id' || columns[0] === 'code') {
      headerColumns = columns;
      return;
    }

    if (!headerColumns) {
      return;
    }

    const rowDraft = {} as Record<keyof ExportRow, ExportRow[keyof ExportRow]>;

    headerColumns.forEach((column, index) => {
      const key = column as keyof ExportRow;
      const rawValue = columns[index] ?? '';
      rowDraft[key] = (numericExportColumns.has(key) ? Number(rawValue) : rawValue) as ExportRow[keyof ExportRow];
    });

    if (!('code' in rowDraft) || typeof rowDraft.code !== 'string' || rowDraft.code.length === 0) {
      rowDraft.code = String(rowDraft.id ?? '');
    }

    if (!('cell' in rowDraft) || typeof rowDraft.cell !== 'string' || rowDraft.cell.length === 0) {
      rowDraft.cell = String(rowDraft.code ?? '');
    }

    if (!('side' in rowDraft) || typeof rowDraft.side !== 'string' || rowDraft.side.length === 0) {
      rowDraft.side = String(rowDraft.code ?? '').slice(-1) as ExportRow['side'];
    }

    rows.push(rowDraft as ExportRow);
  });

  return {
    schemeTitle: schemeTitle || 'Untitled scheme',
    params,
    rows,
    selectedIds: rows.map((row) => row.id),
  };
}

export function downloadCsvFile(document: CsvSchemeDocument, filename = createSchemeFilename(document.schemeTitle, 'csv')) {
  triggerDownload(filename, 'text/csv;charset=utf-8', buildCsvContent(document));
}

export function exportPdf(scene: ExportScene, filename = createSchemeFilename(scene.schemeTitle, 'pdf')) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  drawPlanPage(doc, scene);

  const rowsPerPage = 27;
  const totalPages = Math.max(1, Math.ceil(scene.rows.length / rowsPerPage));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    doc.addPage();
    const start = pageIndex * rowsPerPage;
    const end = start + rowsPerPage;
    drawRowsPage(doc, scene.rows.slice(start, end), pageIndex + 2, scene.schemeTitle);
  }

  doc.save(filename);
}
