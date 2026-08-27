// Type declarations for pdfjs-dist v3 legacy CJS build
declare module "pdfjs-dist/legacy/build/pdf.js" {
  export const GlobalWorkerOptions: { workerSrc: string };

  export interface TextItem {
    str: string;
    transform: number[];
    width: number;
    height: number;
    dir: string;
    fontName: string;
    hasEOL: boolean;
  }

  export interface TextContent {
    items: Array<TextItem | { transform?: never }>;
  }

  export interface PDFPageProxy {
    getTextContent(): Promise<TextContent>;
  }

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface GetDocumentParameters {
    data?: Uint8Array;
    url?: string;
    useWorkerFetch?: boolean;
    isEvalSupported?: boolean;
    useSystemFonts?: boolean;
    disableAutoFetch?: boolean;
    disableStream?: boolean;
  }

  export interface PDFDocumentLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(
    src: GetDocumentParameters | string
  ): PDFDocumentLoadingTask;
}

// Keep the .mjs declaration for the typeof import() cast in ocr.ts
declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export * from "pdfjs-dist/legacy/build/pdf.js";
}