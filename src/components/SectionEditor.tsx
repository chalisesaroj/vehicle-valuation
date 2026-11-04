import React, { useState } from 'react';
import { DocumentSection, DocumentBlock, BlockType } from '../types/document';
import { BlockEditor } from './BlockEditor';
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Scissors,
  FileText,
} from 'lucide-react';

interface SectionEditorProps {
  section: DocumentSection;
  index: number;
  totalSections: number;
  onUpdateSection: (updates: Partial<DocumentSection>) => void;
  onDeleteSection: () => void;
  onMoveSection: (direction: 'up' | 'down') => void;
  onAddBlock: (type: BlockType, atIndex?: number) => void;
  onUpdateBlock: (blockId: string, updated: DocumentBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onOpenAddBlockModal: (atIndex?: number) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  index,
  totalSections,
  onUpdateSection,
  onDeleteSection,
  onMoveSection,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onOpenAddBlockModal,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      id={section.id}
      className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all overflow-hidden scroll-mt-20"
    >
      {/* Optional Page Break Visual Indicator */}
      {section.pageBreakBefore && (
        <div className="bg-amber-100/70 text-amber-900 border-b border-amber-200 px-4 py-1.5 text-[11px] font-medium flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-amber-700 rotate-90" />
            <span>Page Break in PDF — This section starts at the top of a new page</span>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSection({ pageBreakBefore: false })}
            className="text-amber-800 hover:text-amber-950 underline"
          >
            Remove break
          </button>
        </div>
      )}

      {/* Section Header Banner */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Collapse icon & Editable Title */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200 transition"
            title={isCollapsed ? 'Expand section' : 'Collapse section'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <select
            value={section.headingLevel}
            onChange={(e) =>
              onUpdateSection({ headingLevel: parseInt(e.target.value, 10) as 1 | 2 | 3 })
            }
            className="text-xs bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            title="Heading Level in PDF"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>

          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdateSection({ title: e.target.value })}
            placeholder="Section Title..."
            className="flex-1 text-sm font-bold text-slate-900 bg-transparent hover:bg-white focus:bg-white border-b border-transparent hover:border-slate-300 focus:border-blue-600 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Right: Section Actions */}
        <div className="flex items-center gap-1 text-xs">
          {/* Page Break Toggle */}
          <label className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200/70 text-slate-600 cursor-pointer mr-1">
            <input
              type="checkbox"
              checked={section.pageBreakBefore}
              onChange={(e) => onUpdateSection({ pageBreakBefore: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="hidden sm:inline text-[11px]">New Page</span>
          </label>

          <button
            type="button"
            onClick={() => onMoveSection('up')}
            disabled={index === 0}
            className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-20 rounded hover:bg-slate-200 transition"
            title="Move Section Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onMoveSection('down')}
            disabled={index === totalSections - 1}
            className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-20 rounded hover:bg-slate-200 transition"
            title="Move Section Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onOpenAddBlockModal(section.blocks.length)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-300 hover:border-blue-300 rounded font-medium shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Block</span>
          </button>

          <button
            type="button"
            onClick={onDeleteSection}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
            title="Delete this entire section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Section Content Blocks */}
      {!isCollapsed && (
        <div className="p-4 space-y-3 bg-slate-50/30">
          {section.blocks.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 mb-2">This section has no content blocks yet.</p>
              <button
                type="button"
                onClick={() => onOpenAddBlockModal(0)}
                className="text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-xs transition"
              >
                Add Content Block
              </button>
            </div>
          ) : (
            section.blocks.map((block, bIdx) => (
              <BlockEditor
                key={block.id || bIdx}
                block={block}
                onChange={(updated) => onUpdateBlock(block.id, updated)}
                onDelete={() => onDeleteBlock(block.id)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onMoveUp={() => onMoveBlock(block.id, 'up')}
                onMoveDown={() => onMoveBlock(block.id, 'down')}
                onAddBlockAfter={() => onOpenAddBlockModal(bIdx + 1)}
                isFirst={bIdx === 0}
                isLast={bIdx === section.blocks.length - 1}
              />
            ))
          )}

          {/* Bottom Add Block trigger */}
          {section.blocks.length > 0 && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => onOpenAddBlockModal(section.blocks.length)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-md shadow-2xs transition"
              >
                <Plus className="w-3 h-3 text-blue-600" />
                <span>Add Block to Section</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
