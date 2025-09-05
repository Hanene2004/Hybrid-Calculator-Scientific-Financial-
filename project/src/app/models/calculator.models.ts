export interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
  memory: number;
}

export interface FinancialCalculation {
  presentValue: number;
  futureValue: number;
  payment: number;
  interestRate: number;
  periods: number;
  compoundingFrequency: number;
}

export interface AmortizationRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface AmortizationSchedule {
  rows: AmortizationRow[];
  totalPayments: number;
  totalInterest: number;
  totalPrincipal: number;
}

export enum CalculatorMode {
  SCIENTIFIC = 'scientific',
  FINANCIAL = 'financial'
}

export enum AngleMode {
  DEGREES = 'degrees',
  RADIANS = 'radians'
}

export interface FinancialInputs {
  pv?: number;
  fv?: number;
  pmt?: number;
  rate?: number;
  nper?: number;
  type?: 0 | 1; // 0 = end of period, 1 = beginning of period
}