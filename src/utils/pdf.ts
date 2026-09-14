import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  fileName: string;
  summary?: { label: string; value: string }[];
}

export function exportReportPdf(opts: PdfReportOptions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("The PVC House", 14, 18);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(opts.title, 14, 26);

  if (opts.subtitle) {
    doc.setFontSize(9.5);
    doc.setTextColor(110);
    doc.text(opts.subtitle, 14, 32);
    doc.setTextColor(0);
  }

  doc.setFontSize(8.5);
  doc.setTextColor(140);
  doc.text(`Generated ${new Date().toLocaleString()}`, pageWidth - 14, 18, { align: "right" });
  doc.setTextColor(0);

  let startY = opts.subtitle ? 38 : 34;

  if (opts.summary?.length) {
    doc.setFontSize(9.5);
    const chunkSize = 3;
    for (let i = 0; i < opts.summary.length; i += chunkSize) {
      const chunk = opts.summary.slice(i, i + chunkSize);
      const text = chunk.map((s) => `${s.label}: ${s.value}`).join("      ");
      doc.text(text, 14, startY);
      startY += 6;
    }
    startY += 2;
  }

  autoTable(doc, {
    startY,
    head: [opts.columns],
    body: opts.rows,
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [76, 125, 251], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 252] },
    margin: { left: 14, right: 14 },
  });

  doc.save(opts.fileName);
}
