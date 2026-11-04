import React, { useRef } from 'react';
import { ImageBlock, ImageGalleryBlock, GalleryImage } from '../types/document';
import { Upload, Trash2, Plus, Image as ImageIcon, Grid, Check } from 'lucide-react';
import { SAMPLE_VEHICLE_PHOTOS, svgToJpegDataUrl } from '../services/sampleImages';

interface SingleImageEditorProps {
  block: ImageBlock;
  onChange: (updated: ImageBlock) => void;
}

export const SingleImageEditor: React.FC<SingleImageEditorProps> = ({ block, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      onChange({
        ...block,
        filename: safeFilename,
        base64Data: base64Data,
        caption: block.caption || file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_VEHICLE_PHOTOS[0]) => {
    onChange({
      ...block,
      filename: sample.filename,
      base64Data: sample.jpegData,
      caption: sample.caption,
    });
  };

  return (
    <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          Photograph Block ({block.filename})
        </span>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 rounded shadow-2xs transition"
          >
            <Upload className="w-3 h-3 text-slate-500" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Image Preview */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-48 h-32 bg-slate-200 border border-slate-300 rounded overflow-hidden flex items-center justify-center shrink-0 relative group">
          {block.base64Data ? (
            <img
              src={block.base64Data}
              alt={block.caption || 'Vehicle photo'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-2 text-slate-400 text-xs">
              <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
              <span>No image uploaded</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2.5 w-full">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Caption</label>
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              placeholder="e.g. Front 45° angle view showing bumper and headlamps"
              className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                Width in PDF: {block.widthPct || 85}%
              </label>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={block.widthPct || 85}
                onChange={(e) => onChange({ ...block, widthPct: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preset Library Quick Picks */}
      <div className="pt-2 border-t border-slate-200">
        <span className="block text-[11px] font-medium text-slate-500 mb-1.5">
          Or pick standard vehicle inspection view:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_VEHICLE_PHOTOS.map((sample) => (
            <button
              key={sample.filename}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`text-xs px-2 py-1 rounded border transition flex items-center gap-1 ${
                block.filename === sample.filename
                  ? 'bg-blue-100 text-blue-800 border-blue-400 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {block.filename === sample.filename && <Check className="w-3 h-3 text-blue-600" />}
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface GalleryEditorProps {
  block: ImageGalleryBlock;
  onChange: (updated: ImageGalleryBlock) => void;
}

export const GalleryEditor: React.FC<GalleryEditorProps> = ({ block, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const newItem: GalleryImage = {
        id: `img-${Date.now()}`,
        filename: safeFilename,
        title: file.name.replace(/\.[^/.]+$/, ''),
        caption: 'Inspection observation for ' + file.name,
        base64Data,
      };
      onChange({ ...block, items: [...(block.items || []), newItem] });
    };
    reader.readAsDataURL(file);
  };

  const handleAddSample = (sample: typeof SAMPLE_VEHICLE_PHOTOS[0]) => {
    const newItem: GalleryImage = {
      id: `img-${Date.now()}`,
      filename: sample.filename,
      title: sample.title,
      caption: sample.caption,
      base64Data: sample.jpegData,
    };
    onChange({ ...block, items: [...(block.items || []), newItem] });
  };

  const handleUpdateItem = (id: string, updates: Partial<GalleryImage>) => {
    const newItems = (block.items || []).map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange({ ...block, items: newItems });
  };

  const handleDeleteItem = (id: string) => {
    const newItems = (block.items || []).filter((item) => item.id !== id);
    onChange({ ...block, items: newItems });
  };

  return (
    <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-800">
            Inspection Photo Gallery ({block.items?.length || 0} Photos)
          </span>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-600">
            <span>Columns:</span>
            <button
              type="button"
              onClick={() => onChange({ ...block, columns: 2 })}
              className={`px-1.5 py-0.5 rounded font-medium ${
                block.columns === 2 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...block, columns: 3 })}
              className={`px-1.5 py-0.5 rounded font-medium ${
                block.columns === 3 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAddCustomImage}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 rounded shadow-2xs transition"
          >
            <Upload className="w-3 h-3 text-slate-500" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Grid of Photo Cards */}
      <div className={`grid grid-cols-1 ${block.columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3`}>
        {(block.items || []).map((img, idx) => (
          <div
            key={img.id || idx}
            className="bg-white border border-slate-200 rounded-md p-2.5 shadow-xs space-y-2 relative group"
          >
            <div className="h-32 bg-slate-100 rounded overflow-hidden relative">
              {img.base64Data ? (
                <img src={img.base64Data} alt={img.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  {img.filename}
                </div>
              )}
              <button
                type="button"
                onClick={() => handleDeleteItem(img.id)}
                className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-600 hover:text-white text-slate-600 rounded shadow transition"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <input
                type="text"
                value={img.title}
                onChange={(e) => handleUpdateItem(img.id, { title: e.target.value })}
                placeholder="Photo Title"
                className="w-full text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <textarea
                rows={2}
                value={img.caption}
                onChange={(e) => handleUpdateItem(img.id, { caption: e.target.value })}
                placeholder="Observed condition details..."
                className="w-full text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add from Preset Samples */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-500">Add preset angle:</span>
        {SAMPLE_VEHICLE_PHOTOS.map((sample) => (
          <button
            key={sample.filename}
            type="button"
            onClick={() => handleAddSample(sample)}
            className="text-xs px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 rounded transition flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-blue-500" />
            <span>{sample.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
