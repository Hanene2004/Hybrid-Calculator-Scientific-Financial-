import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialService } from '../../services/financial.service';
import { AmortizationSchedule, FinancialInputs } from '../../models/calculator.models';

interface FinancialResult {
  label: string;
  value: number;
  formatted: string;
}

@Component({
  selector: 'app-financial-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="financial-panel fade-in">
      <div class="panel-header">
        <h3>Calculateur Financier</h3>
        <div class="calculation-tabs">
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'basic'"
            (click)="setActiveTab('basic')">
            Calculs de base
          </button>
          <button 
            class="tab-btn" 
            [class.active]="activeTab === 'loan'"
            (click)="setActiveTab('loan')">
            Prêt/Emprunt
          </button>
        </div>
      </div>

      <!-- Onglet Calculs de base -->
      <div class="tab-content" *ngIf="activeTab === 'basic'">
        <div class="input-grid">
          <div class="input-group">
            <label for="pv">Valeur Actuelle (PV)</label>
            <input 
              type="number" 
              id="pv" 
              [(ngModel)]="inputs.pv" 
              (input)="onInputChange()"
              placeholder="0"
              step="0.01">
          </div>

          <div class="input-group">
            <label for="fv">Valeur Future (FV)</label>
            <input 
              type="number" 
              id="fv" 
              [(ngModel)]="inputs.fv" 
              (input)="onInputChange()"
              placeholder="0"
              step="0.01">
          </div>

          <div class="input-group">
            <label for="pmt">Paiement (PMT)</label>
            <input 
              type="number" 
              id="pmt" 
              [(ngModel)]="inputs.pmt" 
              (input)="onInputChange()"
              placeholder="0"
              step="0.01">
          </div>

          <div class="input-group">
            <label for="rate">Taux périodique (%)</label>
            <input 
              type="number" 
              id="rate" 
              [(ngModel)]="ratePercent" 
              (input)="onRateChange()"
              placeholder="0"
              step="0.001">
          </div>

          <div class="input-group">
            <label for="nper">Nombre de périodes</label>
            <input 
              type="number" 
              id="nper" 
              [(ngModel)]="inputs.nper" 
              (input)="onInputChange()"
              placeholder="0"
              step="1">
          </div>

          <div class="input-group">
            <label for="type">Type de paiement</label>
            <select id="type" [(ngModel)]="inputs.type" (change)="onInputChange()">
              <option value="0">Fin de période</option>
              <option value="1">Début de période</option>
            </select>
          </div>
        </div>

        <div class="calculation-buttons">
          <button class="calc-btn" (click)="calculatePV()">Calculer PV</button>
          <button class="calc-btn" (click)="calculateFV()">Calculer FV</button>
          <button class="calc-btn" (click)="calculatePMT()">Calculer PMT</button>
          <button class="calc-btn" (click)="calculateNPER()">Calculer NPER</button>
          <button class="calc-btn" (click)="calculateRATE()">Calculer Taux</button>
          <button class="calc-btn btn-clear" (click)="clearAll()">Effacer</button>
        </div>
      </div>

      <!-- Onglet Prêt/Emprunt -->
      <div class="tab-content" *ngIf="activeTab === 'loan'">
        <div class="loan-inputs">
          <div class="input-group">
            <label for="loanAmount">Montant du prêt</label>
            <input 
              type="number" 
              id="loanAmount" 
              [(ngModel)]="loanInputs.amount" 
              (input)="onLoanInputChange()"
              placeholder="0"
              step="100">
          </div>

          <div class="input-group">
            <label for="annualRate">Taux annuel (%)</label>
            <input 
              type="number" 
              id="annualRate" 
              [(ngModel)]="loanInputs.annualRate" 
              (input)="onLoanInputChange()"
              placeholder="0"
              step="0.01">
          </div>

          <div class="input-group">
            <label for="loanTerm">Durée (mois)</label>
            <input 
              type="number" 
              id="loanTerm" 
              [(ngModel)]="loanInputs.termMonths" 
              (input)="onLoanInputChange()"
              placeholder="0"
              step="1">
          </div>

          <button class="calc-btn btn-primary" (click)="calculateLoan()">
            Calculer le prêt
          </button>
        </div>

        <div class="loan-summary" *ngIf="loanSummary">
          <h4>Résumé du prêt</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Paiement mensuel:</span>
              <span class="value">{{ financialService.formatCurrency(loanSummary.monthlyPayment) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total des paiements:</span>
              <span class="value">{{ financialService.formatCurrency(loanSummary.totalPayments) }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total des intérêts:</span>
              <span class="value">{{ financialService.formatCurrency(loanSummary.totalInterest) }}</span>
            </div>
          </div>

          <button class="calc-btn" (click)="showAmortization = !showAmortization">
            {{ showAmortization ? 'Masquer' : 'Afficher' }} le tableau d'amortissement
          </button>
        </div>
      </div>

      <!-- Résultats -->
      <div class="results-panel" *ngIf="results.length > 0">
        <h4>Résultats</h4>
        <div class="results-grid">
          <div 
            class="result-item" 
            *ngFor="let result of results"
            [class.highlight]="result.value !== 0">
            <span class="result-label">{{ result.label }}:</span>
            <span class="result-value">{{ result.formatted }}</span>
          </div>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div class="error-message" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>

      <!-- Tableau d'amortissement -->
      <div class="amortization-table" *ngIf="showAmortization && amortizationSchedule">
        <h4>Tableau d'amortissement</h4>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Période</th>
                <th>Paiement</th>
                <th>Capital</th>
                <th>Intérêts</th>
                <th>Solde</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of amortizationSchedule.rows; let i = index">
                <td>{{ row.period }}</td>
                <td>{{ financialService.formatCurrency(row.payment) }}</td>
                <td>{{ financialService.formatCurrency(row.principal) }}</td>
                <td>{{ financialService.formatCurrency(row.interest) }}</td>
                <td>{{ financialService.formatCurrency(row.balance) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .financial-panel {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(8px);
      border: 1px solid var(--neutral-200);
      border-radius: 16px;
      padding: 24px;
      box-shadow: var(--shadow-lg);
      max-height: 80vh;
      overflow-y: auto;
    }

    .panel-header {
      margin-bottom: 24px;
    }

    .panel-header h3 {
      color: var(--neutral-800);
      margin-bottom: 16px;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .calculation-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid var(--neutral-200);
      padding-bottom: 8px;
    }

    .tab-btn {
      padding: 8px 16px;
      border-radius: 6px;
      background: var(--neutral-100);
      color: var(--neutral-600);
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      background: var(--neutral-200);
      color: var(--neutral-700);
    }

    .tab-btn.active {
      background: var(--primary-blue);
      color: white;
    }

    .tab-content {
      margin-top: 20px;
    }

    .input-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
    }

    .input-group label {
      font-size: 14px;
      font-weight: 500;
      color: var(--neutral-700);
      margin-bottom: 6px;
    }

    .input-group input,
    .input-group select {
      padding: 12px 14px;
      border: 2px solid var(--neutral-200);
      border-radius: 10px;
      font-size: 14px;
      background: #fff;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .input-group input:focus,
    .input-group select:focus {
      outline: none;
      border-color: var(--primary-blue);
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
    }

    .calculation-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 8px;
      margin-top: 20px;
    }

    .calc-btn {
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      border: 1px solid #3b82f6;
      box-shadow: var(--shadow-sm);
    }

    .calc-btn:hover {
      background: var(--primary-blue-light);
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    .calc-btn.btn-clear {
      background: var(--neutral-400);
      border-color: var(--neutral-400);
    }

    .calc-btn.btn-clear:hover {
      background: var(--neutral-500);
    }

    .calc-btn.btn-primary {
      background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
      border-color: #34d399;
      grid-column: 1 / -1;
    }

    .calc-btn.btn-primary:hover {
      background: #059669;
    }

    .loan-inputs {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .loan-summary {
      margin-top: 20px;
      padding: 16px;
      background: rgba(16,185,129,0.08);
      border-radius: 12px;
      border-left: 4px solid var(--accent-green);
    }

    .loan-summary h4 {
      color: var(--neutral-800);
      margin-bottom: 12px;
      font-size: 1rem;
    }

    .summary-grid {
      display: grid;
      gap: 8px;
      margin-bottom: 16px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .summary-item .label {
      color: var(--neutral-600);
      font-size: 14px;
    }

    .summary-item .value {
      color: var(--neutral-800);
      font-weight: 600;
      font-size: 14px;
    }

    .results-panel {
      margin-top: 20px;
      padding: 16px;
      background: var(--neutral-50);
      border-radius: 8px;
    }

    .results-panel h4 {
      color: var(--neutral-800);
      margin-bottom: 12px;
      font-size: 1rem;
    }

    .results-grid {
      display: grid;
      gap: 8px;
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: white;
      border-radius: 10px;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      border: 1px solid var(--neutral-200);
      box-shadow: var(--shadow-sm);
    }

    .result-item.highlight {
      background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      font-weight: 600;
      border-color: #3b82f6;
    }

    .result-label {
      font-size: 14px;
    }

    .result-value {
      font-size: 14px;
      font-weight: 500;
    }

    .error-message {
      margin-top: 16px;
      padding: 12px;
      background: var(--error);
      color: white;
      border-radius: 6px;
      font-size: 14px;
    }

    .amortization-table {
      margin-top: 24px;
    }

    .amortization-table h4 {
      color: var(--neutral-800);
      margin-bottom: 16px;
      font-size: 1rem;
    }

    .table-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--neutral-200);
      border-radius: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: var(--neutral-100);
      padding: 12px 8px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: var(--neutral-700);
      position: sticky;
      top: 0;
    }

    td {
      padding: 10px 8px;
      border-bottom: 1px solid var(--neutral-200);
      font-size: 12px;
    }

    tr:hover {
      background: var(--neutral-50);
    }

    @media (max-width: 768px) {
      .financial-panel {
        padding: 16px;
      }

      .input-grid {
        grid-template-columns: 1fr;
      }

      .calculation-buttons {
        grid-template-columns: 1fr 1fr;
      }

      .table-container {
        font-size: 11px;
      }

      th, td {
        padding: 8px 6px;
      }
    }
  `]
})
export class FinancialPanelComponent implements OnInit {
  activeTab: 'basic' | 'loan' = 'basic';
  
  inputs: FinancialInputs = {
    pv: undefined,
    fv: undefined,
    pmt: undefined,
    rate: undefined,
    nper: undefined,
    type: 0
  };

  loanInputs = {
    amount: undefined as number | undefined,
    annualRate: undefined as number | undefined,
    termMonths: undefined as number | undefined
  };

  ratePercent: number | undefined;
  results: FinancialResult[] = [];
  errorMessage: string = '';
  loanSummary: any = null;
  amortizationSchedule: AmortizationSchedule | null = null;
  showAmortization = false;

  constructor(public financialService: FinancialService) {}

  ngOnInit(): void {}

  setActiveTab(tab: 'basic' | 'loan'): void {
    this.activeTab = tab;
    this.clearResults();
  }

  onInputChange(): void {
    this.clearResults();
  }

  onRateChange(): void {
    if (this.ratePercent !== undefined) {
      this.inputs.rate = this.ratePercent / 100;
    } else {
      this.inputs.rate = undefined;
    }
    this.clearResults();
  }

  onLoanInputChange(): void {
    this.loanSummary = null;
    this.amortizationSchedule = null;
    this.showAmortization = false;
    this.clearResults();
  }

  calculatePV(): void {
    this.clearResults();
    
    if (!this.validateBasicInputs(['fv', 'rate', 'nper'])) return;
    
    try {
      const pv = this.financialService.calculatePV(
        this.inputs.fv!,
        this.inputs.rate!,
        this.inputs.nper!,
        this.inputs.pmt || 0,
        this.inputs.type || 0
      );
      
      this.inputs.pv = pv;
      this.addResult('Valeur Actuelle (PV)', pv);
    } catch (error) {
      this.showError('Erreur lors du calcul de PV');
    }
  }

  calculateFV(): void {
    this.clearResults();
    
    if (!this.validateBasicInputs(['pv', 'rate', 'nper'])) return;
    
    try {
      const fv = this.financialService.calculateFV(
        this.inputs.pv!,
        this.inputs.rate!,
        this.inputs.nper!,
        this.inputs.pmt || 0,
        this.inputs.type || 0
      );
      
      this.inputs.fv = fv;
      this.addResult('Valeur Future (FV)', fv);
    } catch (error) {
      this.showError('Erreur lors du calcul de FV');
    }
  }

  calculatePMT(): void {
    this.clearResults();
    
    if (!this.validateBasicInputs(['pv', 'rate', 'nper'])) return;
    
    try {
      const pmt = this.financialService.calculatePMT(
        this.inputs.pv!,
        this.inputs.fv || 0,
        this.inputs.rate!,
        this.inputs.nper!,
        this.inputs.type || 0
      );
      
      this.inputs.pmt = pmt;
      this.addResult('Paiement (PMT)', pmt);
    } catch (error) {
      this.showError('Erreur lors du calcul de PMT');
    }
  }

  calculateNPER(): void {
    this.clearResults();
    
    if (!this.validateBasicInputs(['pv', 'pmt', 'rate'])) return;
    
    try {
      const nper = this.financialService.calculateNPER(
        this.inputs.pv!,
        this.inputs.fv || 0,
        this.inputs.pmt!,
        this.inputs.rate!,
        this.inputs.type || 0
      );
      
      if (isNaN(nper) || !isFinite(nper)) {
        this.showError('Impossible de calculer NPER avec ces valeurs');
        return;
      }
      
      this.inputs.nper = Math.round(nper * 100) / 100;
      this.addResult('Nombre de périodes (NPER)', this.inputs.nper);
    } catch (error) {
      this.showError('Erreur lors du calcul de NPER');
    }
  }

  calculateRATE(): void {
    this.clearResults();
    
    if (!this.validateBasicInputs(['pv', 'pmt', 'nper'])) return;
    
    try {
      const rate = this.financialService.calculateRATE(
        this.inputs.pv!,
        this.inputs.fv || 0,
        this.inputs.pmt!,
        this.inputs.nper!,
        this.inputs.type || 0
      );
      
      if (isNaN(rate) || !isFinite(rate)) {
        this.showError('Impossible de calculer le taux avec ces valeurs');
        return;
      }
      
      this.inputs.rate = rate;
      this.ratePercent = rate * 100;
      this.addResult('Taux périodique', rate, this.financialService.formatPercentage(rate));
    } catch (error) {
      this.showError('Erreur lors du calcul du taux');
    }
  }

  calculateLoan(): void {
    this.clearResults();
    
    if (!this.loanInputs.amount || !this.loanInputs.annualRate || !this.loanInputs.termMonths) {
      this.showError('Veuillez remplir tous les champs du prêt');
      return;
    }
    
    try {
      const monthlyRate = this.loanInputs.annualRate / 100 / 12;
      const monthlyPayment = Math.abs(this.financialService.calculatePMT(
        this.loanInputs.amount,
        0,
        monthlyRate,
        this.loanInputs.termMonths,
        0
      ));
      
      const totalPayments = monthlyPayment * this.loanInputs.termMonths;
      const totalInterest = totalPayments - this.loanInputs.amount;
      
      this.loanSummary = {
        monthlyPayment,
        totalPayments,
        totalInterest
      };
      
      // Générer le tableau d'amortissement
      this.amortizationSchedule = this.financialService.generateAmortizationSchedule(
        this.loanInputs.amount,
        this.loanInputs.annualRate / 100,
        this.loanInputs.termMonths
      );
      
    } catch (error) {
      this.showError('Erreur lors du calcul du prêt');
    }
  }

  private validateBasicInputs(requiredFields: string[]): boolean {
    for (const field of requiredFields) {
      const value = (this.inputs as any)[field];
      if (value === undefined || value === null || value === '') {
        this.showError(`Veuillez remplir le champ ${field.toUpperCase()}`);
        return false;
      }
    }
    return true;
  }

  private addResult(label: string, value: number, customFormatted?: string): void {
    this.results.push({
      label,
      value,
      formatted: customFormatted || this.financialService.formatCurrency(value)
    });
  }

  private showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  private clearResults(): void {
    this.results = [];
    this.errorMessage = '';
  }

  clearAll(): void {
    this.inputs = {
      pv: undefined,
      fv: undefined,
      pmt: undefined,
      rate: undefined,
      nper: undefined,
      type: 0
    };
    this.ratePercent = undefined;
    this.clearResults();
  }
}