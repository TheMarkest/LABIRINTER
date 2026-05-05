import { jsPDF } from 'jspdf';
import type { ExportRow, ExportScene } from './types';

const csvColumns: Array<keyof ExportRow> = [
  'id',
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

function drawPlanPage(doc: jsPDF, scene: ExportScene) {
  const { geometry, params, rows, summary } = scene;
  const pageWidth = doc.internal.pageSize.getWidth();
  const planLeft = 108;
  const planTop = 28;
  const planWidth = 86;
  const planHeight = 120;
  const scale = Math.min(planWidth / Math.max(geometry.width, 1), planHeight / Math.max(geometry.height, 1));
  const marginX = planLeft + (planWidth - geometry.width * scale) / 2;
  const marginY = planTop + (planHeight - geometry.height * scale) / 2;
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

  doc.setDrawColor(157, 129, 84);
  doc.roundedRect(14, 40, 80, 92, 4, 4);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Parameters', 18, 49);
  doc.setFont('helvetica', 'normal');

  const parameterLines = [
    `Rows N: ${params.N}`,
    `Columns K: ${params.K}`,
    `Pole spacing D: ${formatNumber(params.D)} m`,
    `Pole height H: ${formatNumber(params.H)} m`,
    `Inner transverse lines P: ${params.P}`,
    `Inner fabric height: ${formatNumber(params.innerFabricHeight)} m`,
    `Perimeter height: ${formatNumber(params.perimeterFabricHeight)} m`,
    `Bend per edge: ${formatNumber(params.bendAllowancePerEdge)} m`,
  ];

  parameterLines.forEach((line, index) => {
    doc.text(line, 18, 58 + index * 8);
  });

  doc.roundedRect(14, 138, 80, 64, 4, 4);
  doc.setFont('helvetica', 'bold');
  doc.text('Material Summary', 18, 147);
  doc.setFont('helvetica', 'normal');

  const summaryLines = [
    `Selected walls: ${summary.selectedCount}`,
    `Interior walls: ${summary.interiorCount}`,
    `Perimeter walls: ${summary.perimeterCount}`,
    `Total wall length: ${formatNumber(summary.totalLength)} m`,
    `Visible fabric area: ${formatNumber(summary.totalVisibleArea)} m2`,
    `Cut fabric area: ${formatNumber(summary.totalCutArea)} m2`,
  ];

  summaryLines.forEach((line, index) => {
    doc.text(line, 18, 156 + index * 8);
  });

  doc.setFont('helvetica', 'bold');
  doc.text('Plan View', 108, 20);
  doc.setDrawColor(157, 129, 84);
  doc.roundedRect(planLeft, planTop, planWidth, planHeight, 4, 4);

  doc.setDrawColor(86, 76, 62);
  doc.setLineWidth(0.2);
  geometry.longitudinalLines.forEach((line) => {
    doc.line(toPdfX(0), toPdfY(line.y), toPdfX(geometry.width), toPdfY(line.y));
  });
  geometry.xPositions.forEach((x) => {
    doc.line(toPdfX(x), toPdfY(0), toPdfX(x), toPdfY(geometry.height));
  });

  doc.setDrawColor(240, 174, 67);
  doc.setLineWidth(1.2);
  rows.forEach((row) => {
    doc.line(toPdfX(row.startX), toPdfY(row.startY), toPdfX(row.endX), toPdfY(row.endY));
  });

  doc.setTextColor(240, 223, 184);
  doc.setFontSize(8);
  geometry.xPositions.forEach((x, index) => {
    doc.text(`X${index}`, toPdfX(x), planTop + planHeight + 6, { align: 'center' });
  });
  geometry.longitudinalLines.forEach((line, index) => {
    doc.text(`Y${index}`, planLeft - 6, toPdfY(line.y) + 1, { align: 'right' });
  });
}

function drawTableHeader(doc: jsPDF, pageNumber: number) {
  doc.setFillColor(20, 16, 12);
  doc.rect(10, 10, 190, 277, 'F');
  doc.setTextColor(240, 223, 184);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Wall Specification', 14, 20);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${pageNumber}`, 180, 20, { align: 'right' });
  doc.text('ID', 14, 32);
  doc.text('Kind', 34, 32);
  doc.text('Axis', 54, 32);
  doc.text('Idx', 68, 32);
  doc.text('Start', 84, 32);
  doc.text('End', 116, 32);
  doc.text('Len', 148, 32);
  doc.text('H', 160, 32);
  doc.text('Area', 171, 32);
  doc.text('Cut', 188, 32, { align: 'right' });
  doc.setDrawColor(157, 129, 84);
  doc.line(14, 35, 190, 35);
}

function drawRowsPage(doc: jsPDF, rows: ExportRow[], pageNumber: number) {
  drawTableHeader(doc, pageNumber);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);

  rows.forEach((row, index) => {
    const y = 42 + index * 8;
    doc.text(row.id, 14, y);
    doc.text(row.kind, 34, y);
    doc.text(row.axis, 54, y);
    doc.text(`${row.gridIndexA}/${row.gridIndexB}`, 68, y);
    doc.text(`${formatNumber(row.startX)},${formatNumber(row.startY)}`, 84, y);
    doc.text(`${formatNumber(row.endX)},${formatNumber(row.endY)}`, 116, y);
    doc.text(formatNumber(row.length), 148, y);
    doc.text(formatNumber(row.visibleHeight), 160, y);
    doc.text(formatNumber(row.visibleArea), 171, y);
    doc.text(formatNumber(row.cutArea), 188, y, { align: 'right' });
  });
}

export function buildCsvContent(rows: ExportRow[]) {
  const header = csvColumns.join(',');
  const body = rows.map((row) => csvColumns.map((column) => String(row[column])).join(','));
  return [header, ...body].join('\n');
}

export function downloadCsvFile(rows: ExportRow[], filename = 'labirinter-walls.csv') {
  triggerDownload(filename, 'text/csv;charset=utf-8', buildCsvContent(rows));
}

export function exportPdf(scene: ExportScene, filename = 'labirinter-scheme.pdf') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  drawPlanPage(doc, scene);

  const rowsPerPage = 28;
  const totalPages = Math.max(1, Math.ceil(scene.rows.length / rowsPerPage));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    doc.addPage();
    const start = pageIndex * rowsPerPage;
    const end = start + rowsPerPage;
    drawRowsPage(doc, scene.rows.slice(start, end), pageIndex + 2);
  }

  doc.save(filename);
}
