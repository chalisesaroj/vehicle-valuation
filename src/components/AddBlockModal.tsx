import React from 'react';
import { BlockType } from '../types/document';
import {
  Heading,
  AlignLeft,
  LayoutGrid,
  Table,
  FileCheck,
  List,
  Image,
  Images,
  Scissors,
  PenTool,
  X,
} from 'lucide-react';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: BlockType) => void;
  targetSectionTitle?: string;
}

const BLOCK_OPTIONS: Array<{
  type: BlockType;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}> = [
  {
    type: 'paragraph',
    title: 'Text / Paragraph',
    description: 'Add a detailed observation, mechanical description, or remark.',
    icon: AlignLeft,
  },
  {
    type: 'heading',
    title: 'Heading',
    description: 'Subsection or category title (H1 to H4 levels).',
    icon: Heading,
  },
  {
    type: 'table',
    title: 'Customizable Table',
    description: 'Structured data table with customizable headers, rows, and cells.',
    icon: Table,
    badge: 'Popular',
  },
  {
    type: 'key_value',
    title: 'Key-Value Grid',
    description: '2 or 3-column specification grid (e.g. Engine CC, Chassis, Fuel).',
    icon: LayoutGrid,
  },
  {
    type: 'callout',
    title: 'Callout / Certificate Box',
    description: 'Highlighted valuation certificate or calculation summary box.',
    icon: FileCheck,
  },
  {
    type: 'list',
    title: 'Bullet or Numbered List',
    description: 'Technical observations, maintenance advisories, or points.',
    icon: List,
  },
  {
    type: 'image_gallery',
    title: 'Inspection Photo Gallery',
    description: '2 or 3-column photographic evidence grid with captions.',
    icon: Images,
    badge: 'Visual',
  },
  {
    type: 'image',
    title: 'Single Photograph',
    description: 'Full-width or custom-scaled vehicle image with caption.',
    icon: Image,
  },
  {
    type: 'signature',
    title: 'Signatures & Seal Block',
    description: 'Engineer and authorized signatory approval lines with official seal.',
    icon: PenTool,
  },
  {
    type: 'page_break',
    title: 'Page Break',
    description: 'Force a clean new page break in the compiled PDF document.',
    icon: Scissors,
  },
];

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
  targetSectionTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Add Content Block</h3>
            <p className="text-xs text-slate-400">
              Inserting into {targetSectionTitle ? `"${targetSectionTitle}"` : 'current section'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Block Types */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BLOCK_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => {
                  onSelectType(opt.type);
                  onClose();
                }}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-600 transition shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 font-medium rounded-full">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
