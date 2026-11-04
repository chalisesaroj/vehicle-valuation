import React, { useState } from 'react';
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
  BlockType,
} from '../types/document';
import {
  Printer,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Scissors,
  Edit3,
  Columns,
  Eye,
  FileCheck,
  Building,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface TabPreviewEditableProps {
  document: ValuationDocument;
  onUpdateDocument: (doc: ValuationDocument) => void;
  onPrintSavePdf: () => void;
  isCompiling: boolean;
  pdfBlobUrl: string | null;
  onOpenAddBlockModal: (sectionId: string, atIndex?: number) => void;
}

export const TabPreviewEditable: React.FC<TabPreviewEditableProps> = ({
  document,
  onUpdateDocument,
  onPrintSavePdf,
  isCompiling,
  pdfBlobUrl,
  onOpenAddBlockModal,
}) => {
  const [editMode, setEditMode] = useState<boolean>(true);
  const [showBreaks, setShowBreaks] = useState<boolean>(true);
  const [showLatexPdfSideBySide, setShowLatexPdfSideBySide] = useState<boolean>(false);
  const [activeSectionId, setActiveSectionId] = useState<string>(document.sections[0]?.id || '');

  const meta = document.meta;

  // Update a block in a section
  const handleUpdateBlock = (sectionId: string, blockId: string, updated: DocumentBlock) => {
    const newSections = document.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const newBlocks = sec.blocks.map((b) => (b.id === blockId ? updated : b));
      return { ...sec, blocks: newBlocks };
    });
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  // Delete a block in a section
  const handleDeleteBlock = (sectionId: string, blockId: string) => {
    const newSections = document.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const newBlocks = sec.blocks.filter((b) => b.id !== blockId);
      return { ...sec, blocks: newBlocks };
    });
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  // Update section title inline
  const handleUpdateSectionTitle = (sectionId: string, newTitle: string) => {
    const newSections = document.sections.map((sec) =>
      sec.id === sectionId ? { ...sec, title: newTitle } : sec
    );
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  // Update table cell inline
  const handleTableCellChange = (sectionId: string, block: TableBlock, rIdx: number, cIdx: number, val: string) => {
    const newRows = block.rows.map((r, i) => {
      if (i !== rIdx) return r;
      const newRow = [...r];
      newRow[cIdx] = val;
      return newRow;
    });
    handleUpdateBlock(sectionId, block.id, { ...block, rows: newRows });
  };

  // Update table header inline
  const handleTableHeaderChange = (sectionId: string, block: TableBlock, cIdx: number, val: string) => {
    const newHeaders = [...block.headers];
    newHeaders[cIdx] = val;
    handleUpdateBlock(sectionId, block.id, { ...block, headers: newHeaders });
  };

  return (
    <div className="space-y-4">
      {/* Preview Bar */}
      <div className="preview-bar no-print flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-300 p-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
            Document Workspace Options
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={editMode}
              onChange={(e) => setEditMode(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive In-Preview Editing {editMode ? '(Active)' : '(Locked)'}</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showBreaks}
              onChange={(e) => setShowBreaks(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>⌗ Show Page Breaks</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={showLatexPdfSideBySide}
              onChange={(e) => setShowLatexPdfSideBySide(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <Columns className="w-3.5 h-3.5 text-purple-600" />
            <span>Show Compiled LaTeX PDF Side-by-Side</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrintSavePdf}
            disabled={isCompiling}
            className="sbd-btn primary"
            title="Compile pure LaTeX vector PDF"
          >
            {isCompiling ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Printer className="w-3.5 h-3.5" />
            )}
            <span>{isCompiling ? 'Compiling PDF...' : 'Print / Save PDF (LaTeX)'}</span>
          </button>
        </div>
      </div>

      {editMode && (
        <div className="sbd-info no-print flex items-center justify-between text-xs bg-amber-50/70 border-amber-300 text-amber-900">
          <div>
            <b>In-Preview Editing Provision:</b> Click on any text, heading, table cell, or remark directly on the A4 page to edit in place. Use the <span className="font-semibold text-blue-700">+ Add Block</span> buttons to introduce new sections or tables.
          </div>
          <span className="text-[11px] font-mono text-amber-800 uppercase">
            Auto-Syncs with LaTeX
          </span>
        </div>
      )}

      {/* Main Preview Layout with Side Nav */}
      <div className={`sbd-preview-layout ${showLatexPdfSideBySide ? 'max-w-none' : ''}`}>
        {/* Side Nav (Table of Contents Jump Sidebar) */}
        <aside className="sbd-side-nav no-print">
          <div className="sbd-side-nav-h">Table of Contents / Navigation</div>
          <ul>
            {document.sections.map((sec, idx) => (
              <li key={sec.id}>
                <a
                  href={`#preview-${sec.id}`}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={activeSectionId === sec.id ? 'active' : ''}
                >
                  <span className="sn-pg">{idx + 1}</span>
                  <span className="sn-txt truncate">{sec.title}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="pt-3 mt-3 border-t border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
              Document Particulars
            </span>
            <div className="text-[11px] text-slate-700 space-y-1">
              <div><b>Reg No:</b> {meta.vehicleRegNo}</div>
              <div><b>Model:</b> {meta.makeModel}</div>
              <div><b>Date:</b> {meta.valuationDate}</div>
              <div><b>Ref:</b> {meta.reportRefNo}</div>
            </div>
          </div>
        </aside>

        {/* Center: A4 Document Pages Preview */}
        <div className="sbd-preview-container">
          {/* A4 Sheet 1: Executive Summary & Letterhead */}
          <div className="sbd-page" id="preview-page-1">
            {/* Running Header */}
            <div className="sbd-page-header">
              <span className="font-bold">{meta.organizationName}</span>
              <span>Ref: {meta.reportRefNo}</span>
            </div>

            {/* Letterhead Header */}
            <div className="text-center pb-4 mb-4 border-b border-black">
              <h1 className="text-xl font-bold tracking-tight uppercase" style={{ color: '#1e3a8a' }}>
                {meta.organizationName}
              </h1>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {meta.organizationSubtitle}
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5">
                {meta.organizationAddress} | {meta.organizationContact}
              </p>
              <div className="w-full h-0.5 bg-black my-2" />
              <h2 className="text-base font-bold uppercase tracking-wider" style={{ color: '#1e3a8a' }}>
                {meta.reportTitle}
              </h2>
              <p className="text-[11px] font-semibold text-slate-800">
                Report Ref No: {meta.reportRefNo} | Date: {meta.valuationDate}
              </p>
            </div>

            {/* Document Sections Rendered in Flow */}
            <div className="space-y-6">
              {document.sections.map((sec, sIdx) => (
                <div key={sec.id} id={`preview-${sec.id}`} className="relative group scroll-mt-24">
                  {/* Page break marker if configured */}
                  {sec.pageBreakBefore && showBreaks && (
                    <div className="no-print my-4 py-1 px-3 bg-amber-100 border border-dashed border-amber-300 text-amber-900 text-[10px] font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Scissors className="w-3 h-3 rotate-90" />
                        Page Break — This section begins on a new page in PDF
                      </span>
                    </div>
                  )}

                  {/* Section Title */}
                  <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2">
                    {editMode ? (
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                        className="sbd-editable-field text-sm font-bold w-full focus:outline-none"
                        style={{ color: '#1e3a8a' }}
                      />
                    ) : (
                      <h3 className="text-sm font-bold" style={{ color: '#1e3a8a' }}>
                        {sec.title}
                      </h3>
                    )}

                    {editMode && (
                      <div className="no-print opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenAddBlockModal(sec.id, sec.blocks.length)}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-semibold rounded"
                        >
                          + Add Block
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section Blocks */}
                  <div className="space-y-3">
                    {sec.blocks.map((block, bIdx) => (
                      <div key={block.id || bIdx} className="relative group/block">
                        {/* Render Block based on Type */}
                        {block.type === 'heading' && (
                          <div className="my-1.5">
                            {editMode ? (
                              <input
                                type="text"
                                value={(block as HeadingBlock).text}
                                onChange={(e) =>
                                  handleUpdateBlock(sec.id, block.id, {
                                    ...(block as HeadingBlock),
                                    text: e.target.value,
                                  })
                                }
                                className="sbd-editable-field w-full font-bold text-slate-800 text-xs focus:outline-none"
                              />
                            ) : (
                              <h4 className="font-bold text-slate-800 text-xs">
                                {(block as HeadingBlock).text}
                              </h4>
                            )}
                          </div>
                        )}

                        {block.type === 'paragraph' && (
                          <div className="my-1">
                            {editMode ? (
                              <textarea
                                rows={Math.max(2, Math.ceil((block as ParagraphBlock).text.length / 90))}
                                value={(block as ParagraphBlock).text}
                                onChange={(e) =>
                                  handleUpdateBlock(sec.id, block.id, {
                                    ...(block as ParagraphBlock),
                                    text: e.target.value,
                                  })
                                }
                                className="sbd-editable-field w-full bg-transparent focus:bg-white resize-y text-xs text-slate-900 leading-relaxed"
                              />
                            ) : (
                              <p className="text-xs text-slate-900 leading-relaxed">
                                {(block as ParagraphBlock).text}
                              </p>
                            )}
                          </div>
                        )}

                        {block.type === 'callout' && (
                          <div
                            className={`p-3 border my-2 ${
                              (block as CalloutBlock).variant === 'certificate'
                                ? 'bg-blue-50/60 border-blue-600'
                                : 'bg-amber-50/60 border-amber-500'
                            }`}
                          >
                            <div className="text-center font-bold text-xs uppercase tracking-wider mb-1" style={{ color: '#1e3a8a' }}>
                              {(block as CalloutBlock).title}
                            </div>
                            <div className="w-16 h-0.5 bg-blue-600 mx-auto mb-2" />
                            {editMode ? (
                              <textarea
                                rows={5}
                                value={(block as CalloutBlock).text}
                                onChange={(e) =>
                                  handleUpdateBlock(sec.id, block.id, {
                                    ...(block as CalloutBlock),
                                    text: e.target.value,
                                  })
                                }
                                className="sbd-editable-field w-full bg-transparent focus:bg-white text-xs leading-relaxed text-slate-900"
                              />
                            ) : (
                              <div className="text-xs leading-relaxed text-slate-900 whitespace-pre-wrap">
                                {(block as CalloutBlock).text}
                              </div>
                            )}
                          </div>
                        )}

                        {block.type === 'key_value' && (
                          <div className="my-2">
                            <table className="sbd-doc-table">
                              <tbody>
                                {(() => {
                                  const items = (block as KeyValueBlock).items || [];
                                  const cols = (block as KeyValueBlock).columns === 3 ? 3 : 2;
                                  const rows = [];
                                  for (let i = 0; i < items.length; i += cols) {
                                    rows.push(items.slice(i, i + cols));
                                  }
                                  return rows.map((row, rIdx) => (
                                    <tr key={rIdx}>
                                      {row.map((item, cIdx) => (
                                        <React.Fragment key={cIdx}>
                                          <td className="w-1/4 font-semibold text-slate-800 bg-slate-50">
                                            {item.label}
                                          </td>
                                          <td className={`w-1/4 ${item.highlight ? 'font-bold text-blue-900' : 'text-slate-900'}`}>
                                            {editMode ? (
                                              <input
                                                type="text"
                                                value={item.value}
                                                onChange={(e) => {
                                                  const newItems = [...items];
                                                  const actualIdx = rIdx * cols + cIdx;
                                                  newItems[actualIdx] = { ...item, value: e.target.value };
                                                  handleUpdateBlock(sec.id, block.id, {
                                                    ...(block as KeyValueBlock),
                                                    items: newItems,
                                                  });
                                                }}
                                                className="sbd-editable-field w-full bg-transparent focus:bg-white text-xs"
                                              />
                                            ) : (
                                              item.value
                                            )}
                                          </td>
                                        </React.Fragment>
                                      ))}
                                    </tr>
                                  ));
                                })()}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {block.type === 'table' && (
                          <div className="my-2 overflow-x-auto">
                            {(block as TableBlock).caption && (
                              <div className="text-[11px] font-bold text-slate-700 mb-1">
                                {(block as TableBlock).caption}
                              </div>
                            )}
                            <table className="sbd-doc-table">
                              <thead>
                                <tr>
                                  {(block as TableBlock).headers.map((h, cIdx) => (
                                    <th key={cIdx}>
                                      {editMode ? (
                                        <input
                                          type="text"
                                          value={h}
                                          onChange={(e) =>
                                            handleTableHeaderChange(sec.id, block as TableBlock, cIdx, e.target.value)
                                          }
                                          className="sbd-editable-field w-full font-bold text-center bg-transparent focus:bg-white"
                                        />
                                      ) : (
                                        h
                                      )}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(block as TableBlock).rows.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={(block as TableBlock).striped && rIdx % 2 === 1 ? 'bg-slate-50' : ''}
                                  >
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx}>
                                        {editMode ? (
                                          <input
                                            type="text"
                                            value={cell}
                                            onChange={(e) =>
                                              handleTableCellChange(sec.id, block as TableBlock, rIdx, cIdx, e.target.value)
                                            }
                                            className="sbd-editable-field w-full bg-transparent focus:bg-white text-xs"
                                          />
                                        ) : (
                                          cell
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {block.type === 'list' && (
                          <div className="my-2">
                            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-900">
                              {(block as ListBlock).items.map((item, iIdx) => (
                                <li key={iIdx}>
                                  {editMode ? (
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => {
                                        const newItems = [...(block as ListBlock).items];
                                        newItems[iIdx] = e.target.value;
                                        handleUpdateBlock(sec.id, block.id, {
                                          ...(block as ListBlock),
                                          items: newItems,
                                        });
                                      }}
                                      className="sbd-editable-field w-full bg-transparent focus:bg-white text-xs"
                                    />
                                  ) : (
                                    item
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {block.type === 'image_gallery' && (
                          <div className="my-3">
                            <div className={`grid grid-cols-1 ${(block as ImageGalleryBlock).columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                              {((block as ImageGalleryBlock).items || []).map((img, iIdx) => (
                                <div key={img.id || iIdx} className="border border-slate-300 p-2 rounded bg-slate-50 text-center">
                                  <div className="h-32 bg-slate-200 overflow-hidden rounded mb-1.5 flex items-center justify-center">
                                    {img.base64Data ? (
                                      <img src={img.base64Data} alt={img.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-xs text-slate-500">{img.filename}</div>
                                    )}
                                  </div>
                                  <div className="font-bold text-xs text-slate-800">{img.title}</div>
                                  {editMode ? (
                                    <textarea
                                      rows={2}
                                      value={img.caption}
                                      onChange={(e) => {
                                        const newItems = [...(block as ImageGalleryBlock).items];
                                        newItems[iIdx] = { ...img, caption: e.target.value };
                                        handleUpdateBlock(sec.id, block.id, {
                                          ...(block as ImageGalleryBlock),
                                          items: newItems,
                                        });
                                      }}
                                      className="sbd-editable-field w-full text-[10.5px] text-slate-600 resize-none mt-1"
                                    />
                                  ) : (
                                    <p className="text-[10.5px] text-slate-600 mt-1">{img.caption}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'signature' && (
                          <div className="my-4 pt-4 border-t border-slate-300">
                            <div className="grid grid-cols-2 gap-8 text-center text-xs">
                              {((block as SignatureBlock).signers || []).map((s, sIdx) => (
                                <div key={s.id || sIdx} className="space-y-1">
                                  <div className="border-b border-dotted border-slate-500 w-48 mx-auto mb-2" />
                                  <div className="font-bold text-sm text-slate-900">{s.name}</div>
                                  <div className="font-semibold text-slate-700">{s.designation}</div>
                                  <div className="text-[11px] text-slate-600">{s.org}</div>
                                  {s.license && <div className="text-[10.5px] text-slate-500">{s.license}</div>}
                                  {s.signatureDate && <div className="text-[10.5px] text-slate-500">Date: {s.signatureDate}</div>}
                                  {s.hasStamp && (
                                    <div className="inline-block mt-2 border border-slate-400 px-3 py-1 text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                                      OFFICIAL SEAL / STAMP
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Inline Delete block button on hover in edit mode */}
                        {editMode && (
                          <div className="no-print opacity-0 group-hover/block:opacity-100 transition-opacity absolute top-0 right-0 -mt-2 -mr-2 bg-white border border-slate-300 rounded shadow-xs p-0.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteBlock(sec.id, block.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                              title="Delete this block"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Running Footer */}
            <div className="sbd-page-footer">
              <span>Vehicle: {meta.vehicleRegNo} ({meta.makeModel})</span>
              <span>Prepared By: {meta.preparedBy}</span>
              <span>Page | 1</span>
            </div>
          </div>
        </div>

        {/* Right Side: Compiled LaTeX PDF Side-by-Side (When enabled) */}
        {showLatexPdfSideBySide && (
          <aside className="w-1/2 flex flex-col bg-slate-900 rounded border border-slate-700 overflow-hidden sticky top-28 h-[calc(100vh-140px)]">
            <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Compiled Vector PDF (pdflatex)
              </span>
              <button
                type="button"
                onClick={onPrintSavePdf}
                disabled={isCompiling}
                className="sbd-btn primary mini"
              >
                {isCompiling ? 'Compiling...' : 'Recompile & Download'}
              </button>
            </div>
            <div className="flex-1 bg-slate-950 relative">
              {pdfBlobUrl ? (
                <iframe
                  src={`${pdfBlobUrl}#toolbar=1`}
                  title="Compiled LaTeX PDF"
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Compiling initial PDF...
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
