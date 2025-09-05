import { Injectable } from '@angular/core';
import { FinancialInputs, AmortizationSchedule, AmortizationRow } from '../models/calculator.models';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {

  // Calcul de la valeur future (FV)
  calculateFV(pv: number, rate: number, nper: number, pmt: number = 0, type: 0 | 1 = 0): number {
    if (rate === 0) {
      return -(pv + pmt * nper);
    }
    
    const pvif = Math.pow(1 + rate, nper);
    const fvifa = (pvif - 1) / rate;
    
    return -(pv * pvif + pmt * fvifa * (1 + rate * type));
  }

  // Calcul de la valeur actuelle (PV)
  calculatePV(fv: number, rate: number, nper: number, pmt: number = 0, type: 0 | 1 = 0): number {
    if (rate === 0) {
      return -(fv + pmt * nper);
    }
    
    const pvif = Math.pow(1 + rate, -nper);
    const pvia = (1 - pvif) / rate;
    
    return -(fv * pvif + pmt * pvia * (1 + rate * type));
  }

  // Calcul du paiement périodique (PMT)
  calculatePMT(pv: number, fv: number, rate: number, nper: number, type: 0 | 1 = 0): number {
    if (rate === 0) {
      return -(pv + fv) / nper;
    }
    
    const pvif = Math.pow(1 + rate, -nper);
    const pvia = (1 - pvif) / rate;
    
    return -(pv + fv * pvif) / (pvia * (1 + rate * type));
  }

  // Calcul du nombre de périodes (NPER)
  calculateNPER(pv: number, fv: number, pmt: number, rate: number, type: 0 | 1 = 0): number {
    if (rate === 0) {
      return -(pv + fv) / pmt;
    }
    
    const adjustedPmt = pmt * (1 + rate * type);
    const numerator = adjustedPmt - fv * rate;
    const denominator = pv * rate + adjustedPmt;
    
    if (numerator <= 0 || denominator <= 0) {
      return NaN;
    }
    
    return Math.log(numerator / denominator) / Math.log(1 + rate);
  }

  // Calcul du taux d'intérêt (RATE) - méthode itérative
  calculateRATE(pv: number, fv: number, pmt: number, nper: number, type: 0 | 1 = 0, guess: number = 0.1): number {
    const tolerance = 1e-10;
    const maxIterations = 100;
    let rate = guess;
    
    for (let i = 0; i < maxIterations; i++) {
      const f = this.rateFunction(rate, pv, fv, pmt, nper, type);
      const df = this.rateDerivative(rate, pv, fv, pmt, nper, type);
      
      if (Math.abs(f) < tolerance) {
        return rate;
      }
      
      if (Math.abs(df) < tolerance) {
        break;
      }
      
      rate = rate - f / df;
    }
    
    return rate;
  }

  private rateFunction(rate: number, pv: number, fv: number, pmt: number, nper: number, type: 0 | 1): number {
    if (rate === 0) {
      return pv + fv + pmt * nper;
    }
    
    const pvif = Math.pow(1 + rate, -nper);
    const pvia = (1 - pvif) / rate;
    
    return pv + fv * pvif + pmt * pvia * (1 + rate * type);
  }

  private rateDerivative(rate: number, pv: number, fv: number, pmt: number, nper: number, type: 0 | 1): number {
    const h = 1e-8;
    return (this.rateFunction(rate + h, pv, fv, pmt, nper, type) - 
            this.rateFunction(rate - h, pv, fv, pmt, nper, type)) / (2 * h);
  }

  // Calcul de l'intérêt composé
  calculateCompoundInterest(principal: number, rate: number, time: number, compoundingFrequency: number = 1): number {
    return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * time);
  }

  // Calcul de l'intérêt simple
  calculateSimpleInterest(principal: number, rate: number, time: number): number {
    return principal * (1 + rate * time);
  }

  // Génération du tableau d'amortissement
  generateAmortizationSchedule(
    loanAmount: number, 
    annualRate: number, 
    loanTermMonths: number, 
    startDate?: Date
  ): AmortizationSchedule {
    const monthlyRate = annualRate / 12;
    const monthlyPayment = this.calculatePMT(loanAmount, 0, monthlyRate, loanTermMonths, 0);
    
    let balance = loanAmount;
    const rows: AmortizationRow[] = [];
    let totalInterest = 0;
    
    for (let period = 1; period <= loanTermMonths; period++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.abs(monthlyPayment) - interestPayment;
      balance -= principalPayment;
      
      // S'assurer que le solde final est exactement zéro
      if (period === loanTermMonths) {
        balance = 0;
      }
      
      totalInterest += interestPayment;
      
      rows.push({
        period,
        payment: Math.abs(monthlyPayment),
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    
    return {
      rows,
      totalPayments: Math.abs(monthlyPayment) * loanTermMonths,
      totalInterest,
      totalPrincipal: loanAmount
    };
  }

  // Conversion de taux annuel en taux périodique
  convertAnnualToPeriodic(annualRate: number, periodsPerYear: number): number {
    return annualRate / periodsPerYear;
  }

  // Conversion de taux périodique en taux annuel
  convertPeriodicToAnnual(periodicRate: number, periodsPerYear: number): number {
    return periodicRate * periodsPerYear;
  }

  // Calcul du taux annuel effectif (APY)
  calculateAPY(nominalRate: number, compoundingFrequency: number): number {
    return Math.pow(1 + nominalRate / compoundingFrequency, compoundingFrequency) - 1;
  }

  // Validation des entrées financières
  validateFinancialInputs(inputs: FinancialInputs): { valid: boolean; message?: string } {
    const { pv, fv, pmt, rate, nper } = inputs;
    
    // Vérifier qu'au moins 4 valeurs sont fournies
    const providedValues = [pv, fv, pmt, rate, nper].filter(v => v !== undefined && v !== null).length;
    
    if (providedValues < 4) {
      return {
        valid: false,
        message: 'Au moins 4 valeurs doivent être fournies pour effectuer le calcul.'
      };
    }
    
    // Vérifier la cohérence des valeurs
    if (rate !== undefined && rate < -1) {
      return {
        valid: false,
        message: 'Le taux d\'intérêt ne peut pas être inférieur à -100%.'
      };
    }
    
    if (nper !== undefined && nper <= 0) {
      return {
        valid: false,
        message: 'Le nombre de périodes doit être positif.'
      };
    }
    
    return { valid: true };
  }

  // Formatage des résultats financiers
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatPercentage(rate: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(rate);
  }
}