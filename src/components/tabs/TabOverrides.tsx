import React from 'react';
import { ValuationDocument, DocumentSection, DocumentBlock, BlockType } from '../../types/document';
import { SectionEditor } from '../SectionEditor';
import { PlusCircle } from 'lucide-react';

interface TabOverridesProps {
  document: ValuationDocument;
  onUpdateDocument: (doc: ValuationDocument) => void;
  onOpenAddBlockModal: (sectionId: string, atIndex?: number) => void;
  onAddSection: () => void;
}

export const TabOverrides: React.FC<TabOverridesProps> = ({
  document,
  onUpdateDocument,
  onOpenAddBlockModal,
  onAddSection,
}) => {
  const handleUpdateSection = (sectionId: string, updates: Partial<DocumentSection>) => {
    const newSections = document.sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    );
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (document.sections.length <= 1) {
      return;
    }
    const newSections = document.sections.filter((s) => s.id !== sectionId);
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const idx = document.sections.findIndex((s) => s.id === sectionId);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === document.sections.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newSections = [...document.sections];
    const temp = newSections[idx];
    newSections[idx] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleUpdateBlock = (sectionId: string, blockId: string, updated: DocumentBlock) => {
    const newSections = document.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const newBlocks = sec.blocks.map((b) => (b.id === blockId ? updated : b));
      return { ...sec, blocks: newBlocks };
    });
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleDeleteBlock = (sectionId: string, blockId: string) => {
    const newSections = document.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const newBlocks = sec.blocks.filter((b) => b.id !== blockId);
      return { ...sec, blocks: newBlocks };
    });
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleDuplicateBlock = (sectionId: string, blockId: string) => {
    const newSections = document.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const idx = sec.blocks.findIndex((b) => b.id === blockId);
      if (idx < 0) return sec;
      const clone = JSON.parse(JSON.stringify(sec.blocks[idx]));
      clone.id = `blk-${Date.now()}`;
      const newBlocks = [...sec.blocks];
      newBlocks.splice(idx + 1, 0, clone);
      return { ...sec, blocks: newBlocks };
    });
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  const handleMoveBlock = (sectionId: string, blockId: string, direction: 'up' | 'down') => {
    const newSections = document.sections.map((sec) => {
      if (sec.id !== sectionId) return sec;
      const idx = sec.blocks.findIndex((b) => b.id === blockId);
      if (idx < 0) return sec;
      if (direction === 'up' && idx === 0) return sec;
      if (direction === 'down' && idx === sec.blocks.length - 1) return sec;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const newBlocks = [...sec.blocks];
      const temp = newBlocks[idx];
      newBlocks[idx] = newBlocks[targetIdx];
      newBlocks[targetIdx] = temp;
      return { ...sec, blocks: newBlocks };
    });
    onUpdateDocument({ ...document, sections: newSections, lastModified: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div className="sbd-card">
        <h2>Document Sections &amp; Block Overrides (Full Structure)</h2>
        <div className="sbd-hint">
          Reorder sections, add arbitrary subsections, insert new tables, paragraphs, or photographs, and control page breaks.
        </div>

        <div className="space-y-4">
          {document.sections.map((section, sIdx) => (
            <SectionEditor
              key={section.id}
              section={section}
              index={sIdx}
              totalSections={document.sections.length}
              onUpdateSection={(updates) => handleUpdateSection(section.id, updates)}
              onDeleteSection={() => handleDeleteSection(section.id)}
              onMoveSection={(direction) => handleMoveSection(section.id, direction)}
              onAddBlock={(type, atIndex) => onOpenAddBlockModal(section.id, atIndex)}
              onUpdateBlock={(bId, updated) => handleUpdateBlock(section.id, bId, updated)}
              onDeleteBlock={(bId) => handleDeleteBlock(section.id, bId)}
              onDuplicateBlock={(bId) => handleDuplicateBlock(section.id, bId)}
              onMoveBlock={(bId, direction) => handleMoveBlock(section.id, bId, direction)}
              onOpenAddBlockModal={(atIndex) => onOpenAddBlockModal(section.id, atIndex)}
            />
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-center">
          <button
            type="button"
            onClick={onAddSection}
            className="sbd-btn primary"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Custom Section to Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
