
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

export interface WinnerRow {
  investorName: string;
  allocatedQuantity: string;
  bidLimit: string;
  investorType: string;
  notes: string;
}

export interface ShelfOfferingData {
  id: string;
  fileName: string;
  securityName: string;
  publicTenderDate: string;
  leadUnderwriter: string;
  subDistributors: string;
  distributionFee: string;
  successFee: string;
  underwritingFee: string;
  offeringAdvisor: string;
  advisoryFee: string;
  concentrationFee: string;
  offeringCoordinator: string;
  offeredQuantity: string;
  openingLimit: string;
  feesNotes: string;
  winnersTable: WinnerRow[];
  extractionTimestamp: number;
}

export interface PrivatePlacementData {
  id: string;
  fileName: string;
  companyName: string;
  securityName: string;
  securityNumber: string;
  tenderDate: string;
  issuedQuantity: string;
  issuePrice: string;
  notes: string;
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

export interface ShelfExtractionItem {
  securityName: string;
  publicTenderDate: string;
  leadUnderwriter: string;
  subDistributors: string;
  distributionFee: string;
  successFee: string;
  underwritingFee: string;
  offeringAdvisor: string;
  advisoryFee: string;
  concentrationFee: string;
  offeringCoordinator: string;
  offeredQuantity: string;
  openingLimit: string;
  feesNotes: string;
  winnersTable: WinnerRow[];
}

export interface ShelfExtractionResult {
  offerings: ShelfExtractionItem[];
}

export interface PrivatePlacementExtractionItem {
  companyName: string;
  securityName: string;
  securityNumber: string;
  tenderDate: string;
  issuedQuantity: string;
  issuePrice: string;
  notes: string;
}

export interface PrivatePlacementExtractionResult {
  placements: PrivatePlacementExtractionItem[];
}
