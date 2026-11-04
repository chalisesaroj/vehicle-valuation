import {
  ValuationDocument,
  DocumentSection,
  DocumentBlock,
  HeadingBlock,
  ParagraphBlock,
  KeyValueBlock,
  TableBlock,
  CalloutBlock,
  ListBlock,
  ImageBlock,
  ImageGalleryBlock,
  SignatureBlock,
} from '../types/document';

/**
 * Escapes characters that have special syntactic meaning in LaTeX.
 */
export function escapeLatex(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  let str = String(text);

  // First handle backslashes so we don't double escape
  str = str.replace(/\\/g, '\\textbackslash{}');

  // Handle markdown bold **text** and italic *text* before escaping symbols
  str = str.replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}');
  str = str.replace(/\*(.*?)\*/g, '\\textit{$1}');

  // Characters requiring backslash in LaTeX
  str = str.replace(/&/g, '\\&');
  str = str.replace(/%/g, '\\%');
  str = str.replace(/\$/g, '\\$');
  str = str.replace(/#/g, '\\#');
  str = str.replace(/_/g, '\\_');
  str = str.replace(/\{/g, '\\{');
  str = str.replace(/\}/g, '\\}');
  str = str.replace(/\^/g, '\\textasciicircum{}');
  str = str.replace(/~/g, '\\textasciitilde{}');

  // Degree symbol
  str = str.replace(/°/g, '$^{\\circ}$');

  return str;
}

/**
 * Converts a single DocumentBlock into its corresponding LaTeX representation.
 */
function renderBlockToLatex(block: DocumentBlock): string {
  switch (block.type) {
    case 'heading': {
      const hb = block as HeadingBlock;
      const text = escapeLatex(hb.text);
      if (hb.level === 1) {
        return `\\vspace{0.4em}\n\\noindent{\\color{NavyPrimary}\\Large\\textbf{${text}}}\n\\vspace{0.2em}\\par\\noindent{\\color{BorderGray}\\rule{\\textwidth}{0.8pt}}\\vspace{0.4em}\n`;
      } else if (hb.level === 2) {
        return `\\vspace{0.3em}\n\\noindent{\\color{DarkSlate}\\large\\textbf{${text}}}\\vspace{0.2em}\\par\n`;
      } else if (hb.level === 3) {
        return `\\vspace{0.2em}\n\\noindent{\\textbf{${text}}}\\vspace{0.15em}\\par\n`;
      } else {
        return `\\vspace{0.15em}\n\\noindent{\\textit{${text}}}\\vspace{0.1em}\\par\n`;
      }
    }

    case 'paragraph': {
      const pb = block as ParagraphBlock;
      let text = escapeLatex(pb.text);
      if (pb.bold) text = `\\textbf{${text}}`;
      if (pb.italic) text = `\\textit{${text}}`;

      if (pb.alignment === 'center') {
        return `\\begin{center}\n${text}\n\\end{center}\n`;
      } else if (pb.alignment === 'right') {
        return `\\begin{flushright}\n${text}\n\\end{flushright}\n`;
      } else {
        return `${text}\\par\\vspace{0.35em}\n`;
      }
    }

    case 'key_value': {
      const kv = block as KeyValueBlock;
      const cols = kv.columns === 3 ? 3 : 2;
      let out = '';
      if (kv.title) {
        out += `\\noindent{\\textbf{${escapeLatex(kv.title)}}}\\vspace{0.2em}\\par\n`;
      }

      const colSpec = cols === 3
        ? '|>{\\bfseries\\small\\color{DarkSlate}}p{0.14\\textwidth}|>{\\small}X|>{\\bfseries\\small\\color{DarkSlate}}p{0.14\\textwidth}|>{\\small}X|>{\\bfseries\\small\\color{DarkSlate}}p{0.14\\textwidth}|>{\\small}X|'
        : '|>{\\bfseries\\small\\color{DarkSlate}}p{0.22\\textwidth}|>{\\small}X|>{\\bfseries\\small\\color{DarkSlate}}p{0.22\\textwidth}|>{\\small}X|';

      out += `\\noindent\\begin{tabularx}{\\textwidth}{${colSpec}}\n\\hline\n`;

      const items = [...kv.items];
      const itemsPerRow = cols;

      for (let i = 0; i < items.length; i += itemsPerRow) {
        const rowItems = items.slice(i, i + itemsPerRow);
        // Pad row if needed
        while (rowItems.length < itemsPerRow) {
          rowItems.push({ label: '', value: '' });
        }

        const cells = rowItems.map((item) => {
          const lbl = escapeLatex(item.label);
          const val = item.highlight
            ? `\\textbf{\\color{NavyPrimary}${escapeLatex(item.value)}}`
            : escapeLatex(item.value);
          return `${lbl} & ${val}`;
        });

        out += `\\rowcolor{LightBg} ${cells.join(' & ')} \\\\ \\hline\n`;
      }

      out += `\\end{tabularx}\\vspace{0.4em}\n`;
      return out;
    }

    case 'table': {
      const tb = block as TableBlock;
      if (!tb.headers || tb.headers.length === 0) return '';

      const numCols = tb.headers.length;
      let out = '';
      if (tb.caption) {
        out += `\\vspace{0.2em}\\noindent{\\small\\textbf{\\color{DarkSlate}${escapeLatex(tb.caption)}}}\\vspace{0.2em}\\par\n`;
      }

      // Column widths: first col small if S.N., last col flexible
      let colDef = '';
      if (numCols === 4) {
        colDef = '|p{0.22\\textwidth}|p{0.26\\textwidth}|p{0.22\\textwidth}|X|';
      } else if (numCols === 5 && tb.headers[0].toLowerCase().includes('s.')) {
        colDef = '|c|>{\\raggedright\\arraybackslash}p{0.26\\textwidth}|c|c|X|';
      } else {
        colDef = '|' + Array(numCols).fill('X').join('|') + '|';
      }

      out += `\\noindent\\begin{tabularx}{\\textwidth}{${colDef}}\n\\hline\n`;

      // Header row
      const headerCells = tb.headers.map((h) => `\\textbf{\\color{NavyPrimary}${escapeLatex(h)}}`);
      out += `\\rowcolor{HeaderBg} ${headerCells.join(' & ')} \\\\ \\hline\n`;

      // Data rows
      (tb.rows || []).forEach((row, idx) => {
        const cells = (row || []).map((cell, cIdx) => {
          let cellText = escapeLatex(cell);
          // Highlight totals if row starts with FMV or Total
          if (row[1] && (row[1].includes('Fair Market') || row[1].includes('Distress') || row[0] === 'H' || row[0] === 'I')) {
            cellText = `\\textbf{${cellText}}`;
          }
          return cellText;
        });
        // Pad row cells if length mismatch
        while (cells.length < numCols) cells.push('');
        const rowColor = (tb.striped && idx % 2 === 1) ? '\\rowcolor{LightBg} ' : '';
        out += `${rowColor}${cells.slice(0, numCols).join(' & ')} \\\\ \\hline\n`;
      });

      out += `\\end{tabularx}\\vspace{0.4em}\n`;
      return out;
    }

    case 'callout': {
      const cb = block as CalloutBlock;
      const title = escapeLatex(cb.title);
      const text = escapeLatex(cb.text);

      let borderColor = 'BorderGray';
      let bgColor = 'LightBg';
      let titleColor = 'NavyPrimary';

      if (cb.variant === 'certificate') {
        borderColor = 'NavyPrimary';
        bgColor = 'HeaderBg';
        titleColor = 'NavyPrimary';
      } else if (cb.variant === 'calculation') {
        borderColor = 'GoldAccent';
        bgColor = 'LightBg';
        titleColor = 'DarkSlate';
      }

      return `\\noindent
\\begin{center}
\\fcolorbox{${borderColor}}{${bgColor}}{%
\\begin{minipage}{0.96\\textwidth}
\\vspace{0.4em}
\\centerline{\\large\\textbf{\\color{${titleColor}}${title}}}
\\vspace{0.3em}
\\hrule height 0.5pt
\\vspace{0.4em}
{\\small ${text.replace(/\n/g, '\\par\\vspace{0.2em}\n')}}
\\vspace{0.4em}
\\end{minipage}%
}
\\end{center}
\\vspace{0.3em}\n`;
    }

    case 'list': {
      const lb = block as ListBlock;
      const env = lb.style === 'numbered' ? 'enumerate' : 'itemize';
      let out = `\\begin{${env}}\n`;
      (lb.items || []).forEach((item) => {
        out += `  \\item ${escapeLatex(item)}\n`;
      });
      out += `\\end{${env}}\\vspace{0.3em}\n`;
      return out;
    }

    case 'image': {
      const ib = block as ImageBlock;
      const width = ib.widthPct ? (ib.widthPct / 100).toFixed(2) : '0.85';
      const caption = ib.caption ? `\\par\\vspace{0.2em}{\\small\\textit{${escapeLatex(ib.caption)}}}` : '';
      return `\\noindent
\\begin{center}
\\IfFileExists{${ib.filename}}{%
  \\includegraphics[width=${width}\\textwidth]{${ib.filename}}%
}{%
  \\fbox{\\begin{minipage}{${width}\\textwidth}\\centering\\vspace{2cm}{\\color{DarkSlate}\\textbf{[Image: ${escapeLatex(ib.filename)}]}}\\\\${caption}\\vspace{2cm}\\end{minipage}}%
}
${caption}
\\end{center}
\\vspace{0.3em}\n`;
    }

    case 'image_gallery': {
      const gb = block as ImageGalleryBlock;
      const cols = gb.columns === 3 ? 3 : 2;
      const colWidth = cols === 3 ? '0.31\\textwidth' : '0.48\\textwidth';

      let out = `\\vspace{0.3em}\\noindent\n`;
      (gb.items || []).forEach((img, idx) => {
        out += `\\begin{minipage}[t]{${colWidth}}
\\centering
\\IfFileExists{${img.filename}}{%
  \\fbox{\\includegraphics[width=\\textwidth]{${img.filename}}}%
}{%
  \\fbox{\\begin{minipage}{\\textwidth}\\centering\\vspace{1.2cm}{\\color{DarkSlate}\\small\\textbf{${escapeLatex(img.title)}}}\\\\${escapeLatex(img.filename)}\\vspace{1.2cm}\\end{minipage}}%
}
\\vspace{0.2em}\\par
{\\small\\textbf{\\color{NavyPrimary}${escapeLatex(img.title)}}}\\\\
{\\footnotesize ${escapeLatex(img.caption)}}
\\end{minipage}`;

        if ((idx + 1) % cols === 0) {
          out += `\\par\\vspace{0.6em}\\noindent\n`;
        } else {
          out += `\\hfill\n`;
        }
      });
      out += `\\vspace{0.4em}\n`;
      return out;
    }

    case 'page_break': {
      return `\\clearpage\n`;
    }

    case 'signature': {
      const sb = block as SignatureBlock;
      let out = '';
      if (sb.title) {
        out += `\\vspace{0.5em}\\noindent{\\textbf{\\color{NavyPrimary}${escapeLatex(sb.title)}}}\\vspace{0.3em}\\par\n`;
      }

      out += `\\vspace{1.5em}\\noindent\n`;
      const signers = sb.signers || [];
      const colWidth = signers.length > 2 ? '0.31\\textwidth' : '0.46\\textwidth';

      signers.forEach((s, idx) => {
        out += `\\begin{minipage}[t]{${colWidth}}
\\begin{center}
\\dotfill\\par\\vspace{0.3em}
{\\large\\textbf{${escapeLatex(s.name)}}}\\\\
{\\small\\textbf{${escapeLatex(s.designation)}}}\\\\
{\\footnotesize ${escapeLatex(s.org || '')}}\\\\
${s.license ? `{\\footnotesize ${escapeLatex(s.license)}}\\\\` : ''}
${s.signatureDate ? `{\\footnotesize Date: ${escapeLatex(s.signatureDate)}}\\\\` : ''}
${s.hasStamp ? `\\vspace{0.4em}\\fbox{\\footnotesize\\quad OFFICIAL SEAL / STAMP\\quad}` : ''}
\\end{center}
\\end{minipage}`;

        if (idx < signers.length - 1) {
          out += `\\hfill\n`;
        }
      });

      out += `\\vspace{1em}\\par\n`;
      return out;
    }

    default:
      return '';
  }
}

/**
 * Generates complete, compilable LaTeX document from the ValuationDocument model.
 */
export function generateLatexFromDocument(doc: ValuationDocument): string {
  const meta = doc.meta;
  const styling = doc.styling || {
    accentColor: '#1e3a8a',
    fontSize: '10pt',
    showRunningHeader: true,
    showPageNumbers: true,
  };

  let latex = `\\documentclass[a4paper,${styling.fontSize || '10pt'}]{article}
\\usepackage[a4paper, top=20mm, bottom=22mm, left=18mm, right=18mm, headheight=26pt, headsep=12pt, footskip=18pt]{geometry}
\\usepackage{fancyhdr}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{booktabs}
\\usepackage{fontspec}
\defaultfontfeatures{Ligatures=TeX}
\setmainfont{DejaVu Sans}

% Corporate & Legal Color Palette
\\definecolor{NavyPrimary}{RGB}{30, 58, 138}
\\definecolor{DarkSlate}{RGB}{51, 65, 85}
\\definecolor{LightBg}{RGB}{248, 250, 252}
\\definecolor{BorderGray}{RGB}{203, 213, 225}
\\definecolor{HeaderBg}{RGB}{224, 231, 255}
\\definecolor{GoldAccent}{RGB}{217, 119, 6}

% Running Headers & Footers
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0.6pt}
\\renewcommand{\\footrulewidth}{0.4pt}
\\lhead{\\footnotesize\\color{DarkSlate}\\textbf{${escapeLatex(meta.organizationName)}}}
\\rhead{\\footnotesize\\color{DarkSlate}Ref: ${escapeLatex(meta.reportRefNo)}}
\\lfoot{\\footnotesize\\color{DarkSlate}Subject: Vehicle ${escapeLatex(meta.vehicleRegNo)}}
\\rfoot{\\footnotesize\\color{DarkSlate}Page \\thepage}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{4pt}

\\begin{document}

% Letterhead Header
\\begin{center}
{\\color{NavyPrimary}\\Large\\textbf{${escapeLatex(meta.organizationName)}}}\\\\
\\vspace{0.1em}
{\\color{DarkSlate}\\small\\textbf{${escapeLatex(meta.organizationSubtitle)}}}\\\\
{\\footnotesize ${escapeLatex(meta.organizationAddress)} $|$ ${escapeLatex(meta.organizationContact)}}\\\\
\\vspace{0.4em}
\\rule{\\textwidth}{1.5pt}\\\\
\\vspace{0.3em}
{\\color{NavyPrimary}\\LARGE\\textbf{${escapeLatex(meta.reportTitle)}}}\\\\
\\vspace{0.1em}
{\\color{DarkSlate}\\small\\textbf{Report Ref No: ${escapeLatex(meta.reportRefNo)} $|$ Valuation Date: ${escapeLatex(meta.valuationDate)}}}\\\\
\\end{center}
\\vspace{0.3em}
`;

  // Render each section
  (doc.sections || []).forEach((section) => {
    if (section.pageBreakBefore) {
      latex += `\\clearpage\n`;
    }

    // Section title
    const secTitle = escapeLatex(section.title);
    if (section.headingLevel === 1) {
      latex += `\\vspace{0.6em}\n\\noindent{\\color{NavyPrimary}\\Large\\textbf{${secTitle}}}\n\\vspace{0.2em}\\par\\noindent{\\color{BorderGray}\\rule{\\textwidth}{1pt}}\\vspace{0.4em}\n`;
    } else if (section.headingLevel === 2) {
      latex += `\\vspace{0.4em}\n\\noindent{\\color{DarkSlate}\\large\\textbf{${secTitle}}}\\vspace{0.3em}\\par\n`;
    } else {
      latex += `\\vspace{0.3em}\n\\noindent{\\textbf{${secTitle}}}\\vspace{0.2em}\\par\n`;
    }

    // Section blocks
    (section.blocks || []).forEach((block) => {
      latex += renderBlockToLatex(block);
    });
  });

  latex += `\n\\end{document}\n`;
  return latex;
}

/**
 * Collects all images present in the document model so they can be sent to the backend.
 */
export function extractDocumentImages(doc: ValuationDocument): Record<string, string> {
  const images: Record<string, string> = {};

  (doc.sections || []).forEach((section) => {
    (section.blocks || []).forEach((block) => {
      if (block.type === 'image') {
        const ib = block as ImageBlock;
        if (ib.filename && ib.base64Data) {
          images[ib.filename] = ib.base64Data;
        }
      } else if (block.type === 'image_gallery') {
        const gb = block as ImageGalleryBlock;
        (gb.items || []).forEach((item) => {
          if (item.filename && item.base64Data) {
            images[item.filename] = item.base64Data;
          }
        });
      }
    });
  });

  return images;
}
