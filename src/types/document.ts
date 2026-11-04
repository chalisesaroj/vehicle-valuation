export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'key_value'
  | 'table'
  | 'callout'
  | 'list'
  | 'image'
  | 'image_gallery'
  | 'page_break'
  | 'signature';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  text: string;
  level: 1 | 2 | 3 | 4;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  text: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  bold?: boolean;
  italic?: boolean;
}

export interface KeyValueItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface KeyValueBlock extends BaseBlock {
  type: 'key_value';
  title?: string;
  columns: 2 | 3;
  items: KeyValueItem[];
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  caption?: string;
  headers: string[];
  rows: string[][];
  alignments?: ('left' | 'center' | 'right')[];
  hasBorders?: boolean;
  striped?: boolean;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  title: string;
  text: string;
  variant: 'certificate' | 'info' | 'warning' | 'calculation';
}

export interface ListBlock extends BaseBlock {
  type: 'list';
  style: 'bullet' | 'numbered';
  items: string[];
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  caption?: string;
  filename: string;
  base64Data?: string;
  widthPct?: number; // 20 to 100
  alignment?: 'center' | 'left' | 'right';
}

export interface GalleryImage {
  id: string;
  title: string;
  caption: string;
  filename: string;
  base64Data?: string;
}

export interface ImageGalleryBlock extends BaseBlock {
  type: 'image_gallery';
  columns: 2 | 3;
  items: GalleryImage[];
}

export interface PageBreakBlock extends BaseBlock {
  type: 'page_break';
}

export interface SignerItem {
  id: string;
  name: string;
  designation: string;
  org?: string;
  license?: string;
  signatureDate?: string;
  hasStamp?: boolean;
}

export interface SignatureBlock extends BaseBlock {
  type: 'signature';
  title?: string;
  signers: SignerItem[];
}

export type DocumentBlock =
  | HeadingBlock
  | ParagraphBlock
  | KeyValueBlock
  | TableBlock
  | CalloutBlock
  | ListBlock
  | ImageBlock
  | ImageGalleryBlock
  | PageBreakBlock
  | SignatureBlock;

export interface DocumentSection {
  id: string;
  title: string;
  headingLevel: 1 | 2 | 3;
  pageBreakBefore: boolean;
  blocks: DocumentBlock[];
}

export interface DocumentMeta {
  reportTitle: string;
  reportRefNo: string;
  valuationDate: string;
  organizationName: string;
  organizationSubtitle: string;
  organizationAddress: string;
  organizationContact: string;
  clientName: string;
  clientAddress: string;
  vehicleRegNo: string;
  makeModel: string;
  preparedBy: string;
  preparedByRole: string;
  preparedByLicense: string;
  placeOfInspection: string;
  purpose: string;
}

export interface DocumentStyling {
  accentColor: string; // e.g. '#1e3a8a'
  fontSize: '9pt' | '10pt' | '11pt';
  showRunningHeader: boolean;
  showPageNumbers: boolean;
}

export interface ValuationDocument {
  id: string;
  version: number;
  meta: DocumentMeta;
  styling: DocumentStyling;
  sections: DocumentSection[];
  lastModified: string;
}

export interface VehicleJsonData {
  version: number;
  form: Record<string, any>;
  state: {
    condition: Record<string, { rating: string; adj: number; remarks: string }>;
    repairs: any[];
    accessories: any[];
    market: Record<string, any>;
    customRates: Record<string, any>;
    photos: any[];
  };
}
