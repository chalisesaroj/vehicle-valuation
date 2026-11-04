import React, { useRef } from 'react';
import { ValuationDocument, ImageGalleryBlock, GalleryImage } from '../../types/document';
import { SAMPLE_VEHICLE_PHOTOS } from '../../services/sampleImages';
import { Upload, Plus, Trash2, Camera } from 'lucide-react';

interface TabPhotosProps {
  document: ValuationDocument;
  onUpdateDocument: (doc: ValuationDocument) => void;
}

export const TabPhotos: React.FC<TabPhotosProps> = ({ document, onUpdateDocument }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoSec = document.sections.find((s) => s.id === 'sec-photos');
  const galleryBlock = photoSec?.blocks.find((b) => b.type === 'image_gallery') as ImageGalleryBlock | undefined;

  const items = galleryBlock?.items || [];

  const handleUpdateItem = (id: string, updates: Partial<GalleryImage>) => {
    if (!photoSec || !galleryBlock) return;
    const newItems = items.map((img) => (img.id === id ? { ...img, ...updates } : img));
    const newBlocks = photoSec.blocks.map((b) => (b.id === galleryBlock.id ? { ...galleryBlock, items: newItems } : b));
    const newSections = document.sections.map((s) => (s.id === photoSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleDeleteItem = (id: string) => {
    if (!photoSec || !galleryBlock) return;
    const newItems = items.filter((img) => img.id !== id);
    const newBlocks = photoSec.blocks.map((b) => (b.id === galleryBlock.id ? { ...galleryBlock, items: newItems } : b));
    const newSections = document.sections.map((s) => (s.id === photoSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleUploadCustomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoSec || !galleryBlock) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const newItem: GalleryImage = {
        id: `img-${Date.now()}`,
        filename: safeFilename,
        title: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
        caption: 'Physical condition recorded on site.',
        base64Data,
      };
      const newItems = [...items, newItem];
      const newBlocks = photoSec.blocks.map((b) => (b.id === galleryBlock.id ? { ...galleryBlock, items: newItems } : b));
      const newSections = document.sections.map((s) => (s.id === photoSec.id ? { ...s, blocks: newBlocks } : s));
      onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddSample = (sample: typeof SAMPLE_VEHICLE_PHOTOS[0]) => {
    if (!photoSec || !galleryBlock) return;
    const newItem: GalleryImage = {
      id: `img-${Date.now()}`,
      filename: sample.filename,
      title: sample.title,
      caption: sample.caption,
      base64Data: sample.jpegData,
    };
    const newItems = [...items, newItem];
    const newBlocks = photoSec.blocks.map((b) => (b.id === galleryBlock.id ? { ...galleryBlock, items: newItems } : b));
    const newSections = document.sections.map((s) => (s.id === photoSec.id ? { ...s, blocks: newBlocks } : s));
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div className="sbd-card">
        <h2>Photographic Evidence &amp; Vehicle Condition Records</h2>
        <div className="sbd-hint">
          Clear visual evidence captured on-site. Real binary JPEGs are embedded directly into the compiled LaTeX PDF.
        </div>

        <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Gallery Layout:</span>
            <button
              type="button"
              onClick={() => {
                if (photoSec && galleryBlock) {
                  const newBlocks = photoSec.blocks.map((b) => (b.id === galleryBlock.id ? { ...galleryBlock, columns: 2 as const } : b));
                  const newSections = document.sections.map((s) => (s.id === photoSec.id ? { ...s, blocks: newBlocks } : s));
                  onUpdateDocument({ ...document, sections: newSections });
                }
              }}
              className={`sbd-btn mini ${galleryBlock?.columns === 2 ? 'primary' : ''}`}
            >
              2 Columns
            </button>
            <button
              type="button"
              onClick={() => {
                if (photoSec && galleryBlock) {
                  const newBlocks = photoSec.blocks.map((b) => (b.id === galleryBlock.id ? { ...galleryBlock, columns: 3 as const } : b));
                  const newSections = document.sections.map((s) => (s.id === photoSec.id ? { ...s, blocks: newBlocks } : s));
                  onUpdateDocument({ ...document, sections: newSections });
                }
              }}
              className={`sbd-btn mini ${galleryBlock?.columns === 3 ? 'primary' : ''}`}
            >
              3 Columns
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="sbd-btn"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadCustomPhoto}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>
        </div>

        {/* Photos Grid */}
        <div className={`grid grid-cols-1 ${galleryBlock?.columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          {items.map((img) => (
            <div key={img.id} className="border border-slate-300 p-3 bg-slate-50 space-y-2">
              <div className="h-40 bg-slate-200 overflow-hidden border border-slate-300 flex items-center justify-center relative">
                {img.base64Data ? (
                  <img src={img.base64Data} alt={img.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-slate-500">{img.filename}</div>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(img.id)}
                  className="absolute top-1.5 right-1.5 bg-black text-white hover:bg-rose-600 p-1 text-xs font-bold"
                  title="Remove photo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Title</label>
                <input
                  type="text"
                  value={img.title}
                  onChange={(e) => handleUpdateItem(img.id, { title: e.target.value })}
                  className="w-full p-1 text-xs font-bold border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase">Caption</label>
                <textarea
                  rows={2}
                  value={img.caption}
                  onChange={(e) => handleUpdateItem(img.id, { caption: e.target.value })}
                  className="w-full p-1 text-xs border border-slate-300 resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add presets */}
        <div className="pt-3 mt-3 border-t border-slate-200">
          <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
            Or add standard inspection angles:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_VEHICLE_PHOTOS.map((s) => (
              <button
                key={s.filename}
                type="button"
                onClick={() => handleAddSample(s)}
                className="sbd-btn mini"
              >
                <Plus className="w-3 h-3" />
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
