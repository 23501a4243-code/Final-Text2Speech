import { jsPDF } from 'jspdf';
import { SpeechProject, CueCard } from '../types/speech';

export function exportSpeechToPdf(project: SpeechProject) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner - Royal Purple & Lavender
  doc.setFillColor(109, 40, 217); // purple-700
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent Lavender Stripe
  doc.setFillColor(168, 85, 247); // purple-500
  doc.rect(0, 38, pageWidth, 2, 'F');

  // Title Text
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(project.title || 'SpeechFlow Speech', margin, 16);

  // Subtitle / Metadata
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFontSize(10);
  const metadata = `Type: ${project.speechType.replace(/_/g, ' ').toUpperCase()}   |   Tone: ${project.tone.toUpperCase()}   |   Words: ${project.wordCount}   |   Est. Time: ${project.estimatedMinutes} mins`;
  doc.text(metadata, margin, 26);
  doc.text(`Generated with SpeechFlow on ${new Date().toLocaleDateString()}`, margin, 33);

  // Body content setup
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13); // Large for podium reading

  let cursorY = 50;
  const lineHeight = 8;
  const paragraphs = project.content.split('\n\n');

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const p = paragraphs[pIdx].trim();
    if (!p) continue;

    const isToast = pIdx === paragraphs.length - 1 || p.toLowerCase().startsWith('to ') || p.toLowerCase().includes('raise your glasses');

    if (isToast) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9); // amber-700
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
    }

    const lines = doc.splitTextToSize(p, contentWidth);

    for (let i = 0; i < lines.length; i++) {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(lines[i], margin, cursorY);
      cursorY += lineHeight;
    }
    cursorY += 4; // Paragraph spacing
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages}  •  ToastCraft AI Stage Cue Sheet`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  const filename = `${project.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_podium_sheet.pdf`;
  doc.save(filename);
}

export function exportCueCardsToPdf(project: SpeechProject) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const cardWidth = pageWidth - margin * 2;
  const cardHeight = 54;

  let cursorY = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(`${project.title} — Stage Cue Cards`, margin, cursorY);
  cursorY += 10;

  project.cueCards.forEach((card, idx) => {
    if (cursorY + cardHeight > 270) {
      doc.addPage();
      cursorY = 20;
    }

    // Card boundary with rounded rect
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, cursorY, cardWidth, cardHeight, 3, 3, 'FD');

    // Stage Cue Header Bar
    doc.setFillColor(147, 51, 234); // purple-600
    doc.rect(margin, cursorY, 4, cardHeight, 'F');

    // Card number & timing
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(147, 51, 234); // purple-600
    doc.text(`CARD ${card.cardIndex}   [${card.timingEstimate}]`, margin + 8, cursorY + 8);

    // Stage Cue instruction
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(card.stageCue, margin + 8, cursorY + 16);

    // Talking points / content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const contentLines = doc.splitTextToSize(card.content, cardWidth - 16);
    doc.text(contentLines.slice(0, 3), margin + 8, cursorY + 24);

    // Delivery Tip
    if (card.keyTip) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tip: ${card.keyTip}`, margin + 8, cursorY + cardHeight - 6);
    }

    cursorY += cardHeight + 8;
  });

  const filename = `${project.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}_cue_cards.pdf`;
  doc.save(filename);
}

export function downloadAsText(project: SpeechProject) {
  const content = `=====================================================
${project.title.toUpperCase()}
=====================================================
Speech Type: ${project.speechType.replace(/_/g, ' ')}
Tone: ${project.tone}
Word Count: ${project.wordCount} words
Estimated Duration: ~${project.estimatedMinutes} minutes
Generated with ToastCraft AI
=====================================================

${project.content}

-----------------------------------------------------
STAGE CUE CARDS:
-----------------------------------------------------
${project.cueCards.map(c => `[CARD ${c.cardIndex}] ${c.stageCue} (${c.timingEstimate})
${c.content}
Tip: ${c.keyTip || 'Breathe and speak clearly'}
`).join('\n')}
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
