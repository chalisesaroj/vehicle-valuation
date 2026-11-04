import React from 'react';
import {
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
  SignerItem,
  KeyValueItem,
} from '../types/document';
import { TableBlockEditor } from './TableBlockEditor';
import { SingleImageEditor, GalleryEditor } from './ImageBlockEditor';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Plus,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ShieldCheck,
  List as ListIcon,
  PlusCircle,
  FileBadge,
} from 'lucide-react';

interface BlockEditorProps {
  block: DocumentBlock;
  onChange: (updated: DocumentBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddBlockAfter: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onAddBlockAfter,
  isFirst,
  isLast,
}) => {
  return (
    <div className="group relative bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3 transition shadow-2xs hover:shadow-xs">
      {/* Top Action Toolbar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            {block.type.replace('_', ' ')}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded hover:bg-slate-100 transition"
            title="Move block up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded hover:bg-slate-100 transition"
            title="Move block down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition"
            title="Duplicate block"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
            title="Delete block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block Body By Type */}
      <div className="space-y-2">
        {block.type === 'heading' && (
          <HeadingEditor block={block as HeadingBlock} onChange={onChange} />
        )}

        {block.type === 'paragraph' && (
          <ParagraphEditor block={block as ParagraphBlock} onChange={onChange} />
        )}

        {block.type === 'key_value' && (
          <KeyValueEditor block={block as KeyValueBlock} onChange={onChange} />
        )}

        {block.type === 'table' && (
          <TableBlockEditor block={block as TableBlock} onChange={onChange} />
        )}

        {block.type === 'callout' && (
          <CalloutEditor block={block as CalloutBlock} onChange={onChange} />
        )}

        {block.type === 'list' && (
          <ListBlockEditor block={block as ListBlock} onChange={onChange} />
        )}

        {block.type === 'image' && (
          <SingleImageEditor block={block as ImageBlock} onChange={onChange} />
        )}

        {block.type === 'image_gallery' && (
          <GalleryEditor block={block as ImageGalleryBlock} onChange={onChange} />
        )}

        {block.type === 'page_break' && (
          <div className="py-3 px-4 bg-amber-50 border border-dashed border-amber-300 rounded text-center text-xs text-amber-800 font-medium flex items-center justify-center gap-2">
            <span>--- Page Break (Starts next content on fresh page in PDF) ---</span>
          </div>
        )}

        {block.type === 'signature' && (
          <SignatureEditor block={block as SignatureBlock} onChange={onChange} />
        )}
      </div>

      {/* Subtle Add Block After trigger */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center -mb-5 mt-2 z-10 relative">
        <button
          type="button"
          onClick={onAddBlockAfter}
          className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-full border border-blue-200 shadow-xs transition"
        >
          <Plus className="w-3 h-3" />
          <span>Insert Block Below</span>
        </button>
      </div>
    </div>
  );
};

/* --- Heading Block Sub-Editor --- */
const HeadingEditor: React.FC<{
  block: HeadingBlock;
  onChange: (b: HeadingBlock) => void;
}> = ({ block, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <select
        value={block.level}
        onChange={(e) => onChange({ ...block, level: parseInt(e.target.value, 10) as any })}
        className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value={1}>H1 (Main)</option>
        <option value={2}>H2 (Section)</option>
        <option value={3}>H3 (Sub)</option>
        <option value={4}>H4 (Minor)</option>
      </select>
      <input
        type="text"
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Heading text..."
        className={`flex-1 px-2 py-1 bg-transparent border-b border-slate-200 focus:border-blue-600 focus:outline-none ${
          block.level === 1
            ? 'text-base font-bold text-blue-900'
            : block.level === 2
            ? 'text-sm font-bold text-slate-800'
            : 'text-xs font-semibold text-slate-700'
        }`}
      />
    </div>
  );
};

/* --- Paragraph Block Sub-Editor --- */
const ParagraphEditor: React.FC<{
  block: ParagraphBlock;
  onChange: (b: ParagraphBlock) => void;
}> = ({ block, onChange }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 text-xs">
        <button
          type="button"
          onClick={() => onChange({ ...block, bold: !block.bold })}
          className={`p-1 rounded transition ${
            block.bold ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Bold text"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...block, italic: !block.italic })}
          className={`p-1 rounded transition ${
            block.italic ? 'bg-blue-100 text-blue-800 italic' : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Italic text"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <div className="h-3 w-px bg-slate-200 mx-1" />
        <button
          type="button"
          onClick={() => onChange({ ...block, alignment: 'left' })}
          className={`p-1 rounded transition ${
            block.alignment === 'left' || !block.alignment
              ? 'bg-slate-200 text-slate-800'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...block, alignment: 'center' })}
          className={`p-1 rounded transition ${
            block.alignment === 'center'
              ? 'bg-slate-200 text-slate-800'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...block, alignment: 'right' })}
          className={`p-1 rounded transition ${
            block.alignment === 'right'
              ? 'bg-slate-200 text-slate-800'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <textarea
        rows={3}
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Enter paragraph or observation remarks..."
        className={`w-full text-xs p-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 leading-relaxed resize-y ${
          block.bold ? 'font-bold' : ''
        } ${block.italic ? 'italic' : ''} ${
          block.alignment === 'center'
            ? 'text-center'
            : block.alignment === 'right'
            ? 'text-right'
            : 'text-left'
        }`}
      />
    </div>
  );
};

/* --- Key-Value Sub-Editor --- */
const KeyValueEditor: React.FC<{
  block: KeyValueBlock;
  onChange: (b: KeyValueBlock) => void;
}> = ({ block, onChange }) => {
  const items = block.items || [];

  const handleItemChange = (idx: number, updates: Partial<KeyValueItem>) => {
    const newItems = items.map((item, i) => (i === idx ? { ...item, ...updates } : item));
    onChange({ ...block, items: newItems });
  };

  const addItem = () => {
    onChange({
      ...block,
      items: [...items, { label: 'New Field', value: 'Value' }],
    });
  };

  const removeItem = (idx: number) => {
    onChange({
      ...block,
      items: items.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          value={block.title || ''}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Group Title (e.g. Particulars)"
          className="text-xs font-semibold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1"
        />
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Cols:</span>
          <button
            type="button"
            onClick={() => onChange({ ...block, columns: 2 })}
            className={`px-1.5 py-0.5 rounded font-medium ${
              block.columns === 2 ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            2
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...block, columns: 3 })}
            className={`px-1.5 py-0.5 rounded font-medium ${
              block.columns === 3 ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            3
          </button>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200"
          >
            <Plus className="w-3 h-3" />
            <span>Add Pair</span>
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${block.columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2`}>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded group"
          >
            <input
              type="text"
              value={item.label}
              onChange={(e) => handleItemChange(idx, { label: e.target.value })}
              placeholder="Label"
              className="w-1/2 text-xs font-semibold text-slate-700 bg-transparent focus:bg-white px-1 py-0.5 rounded border-b border-transparent focus:border-blue-500 focus:outline-none"
            />
            <span className="text-slate-300">:</span>
            <input
              type="text"
              value={item.value}
              onChange={(e) => handleItemChange(idx, { value: e.target.value })}
              placeholder="Value"
              className={`w-1/2 text-xs bg-transparent focus:bg-white px-1 py-0.5 rounded border-b border-transparent focus:border-blue-500 focus:outline-none ${
                item.highlight ? 'font-bold text-blue-700' : 'text-slate-800'
              }`}
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="text-slate-300 hover:text-rose-600 p-0.5"
              title="Remove"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --- Callout Sub-Editor --- */
const CalloutEditor: React.FC<{
  block: CalloutBlock;
  onChange: (b: CalloutBlock) => void;
}> = ({ block, onChange }) => {
  return (
    <div
      className={`p-3 rounded-lg border space-y-2 ${
        block.variant === 'certificate'
          ? 'bg-blue-50/70 border-blue-300 text-blue-900'
          : block.variant === 'calculation'
          ? 'bg-amber-50/70 border-amber-300 text-amber-900'
          : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <FileBadge className="w-4 h-4 text-blue-700" />
          <input
            type="text"
            value={block.title}
            onChange={(e) => onChange({ ...block, title: e.target.value })}
            placeholder="Box Title"
            className="text-xs font-bold uppercase tracking-wider bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none w-full"
          />
        </div>

        <select
          value={block.variant}
          onChange={(e) => onChange({ ...block, variant: e.target.value as any })}
          className="text-[11px] bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700"
        >
          <option value="certificate">Certificate Style</option>
          <option value="calculation">Calculation Style</option>
          <option value="info">Info Notice</option>
          <option value="warning">Warning / Caution</option>
        </select>
      </div>

      <textarea
        rows={4}
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Certificate or callout statement..."
        className="w-full text-xs p-2 bg-white/80 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-y"
      />
    </div>
  );
};

/* --- List Sub-Editor --- */
const ListBlockEditor: React.FC<{
  block: ListBlock;
  onChange: (b: ListBlock) => void;
}> = ({ block, onChange }) => {
  const items = block.items || [];

  const handleItemChange = (idx: number, val: string) => {
    const newItems = [...items];
    newItems[idx] = val;
    onChange({ ...block, items: newItems });
  };

  const addItem = () => {
    onChange({ ...block, items: [...items, 'New observation point...'] });
  };

  const removeItem = (idx: number) => {
    onChange({ ...block, items: items.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Style:</span>
          <button
            type="button"
            onClick={() => onChange({ ...block, style: 'bullet' })}
            className={`px-2 py-0.5 rounded ${
              block.style === 'bullet' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Bullet
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...block, style: 'numbered' })}
            className={`px-2 py-0.5 rounded ${
              block.style === 'numbered' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Numbered (1, 2, 3)
          </button>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200"
        >
          <Plus className="w-3 h-3" />
          <span>Add Point</span>
        </button>
      </div>

      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-slate-400 text-xs font-mono mt-1.5 select-none w-5 text-right">
              {block.style === 'numbered' ? `${idx + 1}.` : '•'}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              className="flex-1 text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* --- Signature Sub-Editor --- */
const SignatureEditor: React.FC<{
  block: SignatureBlock;
  onChange: (b: SignatureBlock) => void;
}> = ({ block, onChange }) => {
  const signers = block.signers || [];

  const handleSignerChange = (idx: number, updates: Partial<SignerItem>) => {
    const newSigners = signers.map((s, i) => (i === idx ? { ...s, ...updates } : s));
    onChange({ ...block, signers: newSigners });
  };

  const addSigner = () => {
    const newSigner: SignerItem = {
      id: `sig-${Date.now()}`,
      name: 'Authorized Signatory',
      designation: 'Reviewer / Branch Manager',
      org: 'Cooperatives Limited',
      license: '',
      signatureDate: new Date().toISOString().split('T')[0],
      hasStamp: true,
    };
    onChange({ ...block, signers: [...signers, newSigner] });
  };

  const removeSigner = (idx: number) => {
    onChange({ ...block, signers: signers.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          value={block.title || ''}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Signature Section Title (Optional)"
          className="text-xs font-semibold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1"
        />
        <button
          type="button"
          onClick={addSigner}
          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200"
        >
          <Plus className="w-3 h-3" />
          <span>Add Signatory Block</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {signers.map((s, idx) => (
          <div
            key={s.id || idx}
            className="p-3 bg-white border border-slate-200 rounded-md space-y-2 shadow-2xs relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-[11px] font-semibold text-slate-500">
                Signer #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeSigner(idx)}
                className="text-slate-300 hover:text-rose-600 p-0.5"
                title="Remove signatory"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-medium">Full Name</label>
              <input
                type="text"
                value={s.name}
                onChange={(e) => handleSignerChange(idx, { name: e.target.value })}
                className="w-full text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-medium">Designation / Role</label>
              <input
                type="text"
                value={s.designation}
                onChange={(e) => handleSignerChange(idx, { designation: e.target.value })}
                className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-medium">Organization / Firm</label>
              <input
                type="text"
                value={s.org || ''}
                onChange={(e) => handleSignerChange(idx, { org: e.target.value })}
                className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-medium">License / Reg No.</label>
                <input
                  type="text"
                  value={s.license || ''}
                  onChange={(e) => handleSignerChange(idx, { license: e.target.value })}
                  placeholder="e.g. NEC 14289"
                  className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-medium">Date</label>
                <input
                  type="text"
                  value={s.signatureDate || ''}
                  onChange={(e) => handleSignerChange(idx, { signatureDate: e.target.value })}
                  className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={s.hasStamp !== false}
                  onChange={(e) => handleSignerChange(idx, { hasStamp: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Include Official Seal / Stamp Box</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
