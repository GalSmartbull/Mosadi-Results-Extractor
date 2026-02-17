
export interface TenderData {
  id: string;
  fileName: string;
  securityName: string;
  totalUnitsBid: number;
  totalValueBid: number;
  closingPrice: number;
  allocatedUnits: number;
  totalProceeds: number;
  extractionTimestamp: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ExtractionResultItem {
  securityName: string;
  totalUnitsBid: number;
  totalValueBid: number;
  closingPrice: number;
  allocatedUnits: number;
  totalProceeds: number;
}

export interface ExtractionResult {
  securities: ExtractionResultItem[];
}
