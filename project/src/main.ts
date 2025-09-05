import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { CalculatorService } from './app/services/calculator.service';
import { FinancialService } from './app/services/financial.service';
import { CalculatorDisplayComponent } from './app/components/calculator-display/calculator-display.component';
import { ScientificKeypadComponent } from './app/components/scientific-keypad/scientific-keypad.component';
import { FinancialPanelComponent } from './app/components/financial-panel/financial-panel.component';
import { CalculatorMode, AngleMode } from './app/models/calculator.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CalculatorDisplayComponent,
    ScientificKeypadComponent,
    FinancialPanelComponent
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="app-title">
            <h1>Calculatrice Hybride</h1>
            <p>Scientifique & Financière</p>
          </div>
          
          <div class="mode-selector">
            <button 
              class="mode-btn"
              [class.active]="currentMode === CalculatorMode.SCIENTIFIC"
              (click)="setMode(CalculatorMode.SCIENTIFIC)">
              <span class="mode-icon">🧮</span>
              Scientifique
            </button>
            <button 
              class="mode-btn"
              [class.active]="currentMode === CalculatorMode.FINANCIAL"
              (click)="setMode(CalculatorMode.FINANCIAL)">
              <span class="mode-icon">💰</span>
              Financière
            </button>
          </div>
        </div>
      </header>

      <main class="app-main">
        <div class="calculator-container">
          <!-- Mode Scientifique -->
          <div class="calculator-section" *ngIf="currentMode === CalculatorMode.SCIENTIFIC">
            <div class="calculator-display-container">
              <app-calculator-display
                [displayValue]="currentState.display"
                [expression]="buildExpression()"
                [mode]="currentMode"
                [angleMode]="currentAngleMode"
                [memoryValue]="currentState.memory">
              </app-calculator-display>
            </div>
            
            <div class="calculator-keypad-container">
              <app-scientific-keypad
                [activeOperation]="currentState.operation"
                [angleMode]="currentAngleMode"
                (numberClick)="onNumberClick($event)"
                (operatorClick)="onOperatorClick($event)"
                (functionClick)="onFunctionClick($event)"
                (constantClick)="onConstantClick($event)"
                (memoryClick)="onMemoryClick($event)"
                (clearClick)="onClear()"
                (backspaceClick)="onBackspace()"
                (decimalClick)="onDecimalClick()"
                (equalsClick)="onEquals()"
                (angleToggle)="onAngleToggle()">
              </app-scientific-keypad>
            </div>
          </div>

          <!-- Mode Financier -->
          <div class="financial-section" *ngIf="currentMode === CalculatorMode.FINANCIAL">
            <app-financial-panel></app-financial-panel>
          </div>
        </div>

        <!-- Panneau d'aide contextuel -->
        <aside class="help-panel" [class.visible]="showHelp">
          <div class="help-header">
            <h3>Aide</h3>
            <button class="close-help" (click)="toggleHelp()">×</button>
          </div>
          
          <div class="help-content" *ngIf="currentMode === CalculatorMode.SCIENTIFIC">
            <h4>Mode Scientifique</h4>
            <div class="help-section">
              <h5>Fonctions trigonométriques</h5>
              <p>sin, cos, tan - Fonctions trigonométriques de base</p>
              <p>Mode: {{ currentAngleMode }} (cliquer pour changer)</p>
            </div>
            <div class="help-section">
              <h5>Mémoire</h5>
              <p>MC: Effacer la mémoire</p>
              <p>MR: Rappeler la mémoire</p>
              <p>M+: Ajouter à la mémoire</p>
              <p>M-: Soustraire de la mémoire</p>
            </div>
          </div>

          <div class="help-content" *ngIf="currentMode === CalculatorMode.FINANCIAL">
            <h4>Mode Financier</h4>
            <div class="help-section">
              <h5>Valeurs de base</h5>
              <p>PV: Valeur actuelle</p>
              <p>FV: Valeur future</p>
              <p>PMT: Paiement périodique</p>
              <p>NPER: Nombre de périodes</p>
              <p>RATE: Taux d'intérêt périodique</p>
            </div>
          </div>
        </aside>
      </main>

      <!-- Bouton d'aide flottant -->
      <button class="help-toggle" (click)="toggleHelp()" [class.active]="showHelp">
        <span class="help-icon">?</span>
      </button>

      <!-- Footer -->
      <footer class="app-footer">
        <p>&copy; 2025 Calculatrice Hybride - Conçue avec Angular</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: radial-gradient(1200px 600px at 10% -10%, rgba(37,99,235,0.08), transparent 60%),
                  radial-gradient(1000px 500px at 110% 10%, rgba(16,185,129,0.08), transparent 60%),
                  linear-gradient(135deg, var(--neutral-50) 0%, var(--neutral-100) 100%);
    }

    .app-header {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--neutral-200);
      box-shadow: var(--shadow);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .app-title h1 {
      color: var(--neutral-800);
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0;
    }

    .app-title p {
      color: var(--neutral-600);
      font-size: 0.9rem;
      margin: 0;
      font-weight: 500;
    }

    .mode-selector {
      display: flex;
      background: rgba(255,255,255,0.8);
      border: 1px solid var(--neutral-200);
      border-radius: 12px;
      padding: 4px;
      gap: 6px;
      box-shadow: var(--shadow-sm);
    }

    .mode-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 10px;
      background: transparent;
      color: var(--neutral-600);
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s ease, color 0.2s ease, transform 0.1s ease;
    }

    .mode-btn:hover {
      background: var(--neutral-200);
      color: var(--neutral-700);
      transform: translateY(-1px);
    }

    .mode-btn.active {
      background: linear-gradient(90deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%);
      color: white;
      box-shadow: var(--shadow);
    }

    .mode-icon {
      font-size: 16px;
    }

    .app-main {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      width: 100%;
      display: flex;
      gap: 20px;
      position: relative;
    }

    .calculator-container {
      flex: 1;
      min-width: 0;
    }

    .calculator-section {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      animation: slideIn 0.4s ease-out;
    }

    .financial-section {
      animation: slideIn 0.4s ease-out;
    }

    .calculator-display-container {
      width: 100%;
      animation: fadeIn 0.3s ease-in-out;
    }

    .calculator-keypad-container {
      width: 100%;
      animation: fadeIn 0.3s ease-in-out 50ms both;
    }

    .help-panel {
      position: fixed;
      top: 0;
      right: -360px;
      width: 360px;
      height: 100vh;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(8px);
      border-left: 1px solid var(--neutral-200);
      box-shadow: var(--shadow-lg);
      transition: right 0.3s ease;
      z-index: 200;
      overflow-y: auto;
    }

    .help-panel.visible {
      right: 0;
    }

    .help-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid var(--neutral-200);
      position: sticky;
      top: 0;
      background: white;
      z-index: 1;
    }

    .help-header h3 {
      color: var(--neutral-800);
      margin: 0;
      font-size: 1.25rem;
    }

    .close-help {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--neutral-200);
      color: var(--neutral-600);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.2s ease;
    }

    .close-help:hover {
      background: var(--neutral-300);
      color: var(--neutral-700);
    }

    .help-content {
      padding: 20px;
    }

    .help-content h4 {
      color: var(--primary-blue);
      margin: 0 0 16px 0;
      font-size: 1.1rem;
    }

    .help-section {
      margin-bottom: 20px;
    }

    .help-section h5 {
      color: var(--neutral-700);
      margin: 0 0 8px 0;
      font-size: 1rem;
    }

    .help-section p {
      color: var(--neutral-600);
      margin: 4px 0;
      font-size: 14px;
      line-height: 1.4;
    }

    .help-toggle {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--primary-blue);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      z-index: 150;
      transition: all 0.3s ease;
    }

    .help-toggle:hover {
      background: var(--primary-blue-light);
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -5px rgba(37, 99, 235, 0.4);
    }

    .help-toggle.active {
      background: var(--accent-orange);
    }

    .help-icon {
      display: block;
    }

    .app-footer {
      background: var(--neutral-800);
      color: var(--neutral-300);
      text-align: center;
      padding: 16px 20px;
      margin-top: auto;
    }

    .app-footer p {
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 1024px) {
      .help-panel {
        width: 300px;
        right: -300px;
      }
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .mode-selector {
        align-self: center;
      }

      .app-main {
        padding: 15px;
      }

      .help-panel {
        width: 100%;
        right: -100%;
      }

      .help-toggle {
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
      }
    }

    @media (max-width: 480px) {
      .app-main {
        padding: 10px;
      }

      .header-content {
        padding: 12px 15px;
      }

      .app-title h1 {
        font-size: 1.5rem;
      }

      .mode-btn {
        padding: 8px 12px;
        font-size: 13px;
      }
    }
  `]
})
export class App {
  // Expose enum to the template
  readonly CalculatorMode = CalculatorMode;
  currentMode: CalculatorMode = CalculatorMode.SCIENTIFIC;
  currentAngleMode: AngleMode = AngleMode.DEGREES;
  currentState: any = {
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
    memory: 0
  };
  showHelp = false;

  constructor(
    private calculatorService: CalculatorService,
    private financialService: FinancialService
  ) {
    // Subscribe to calculator state changes
    this.calculatorService.state$.subscribe(state => {
      this.currentState = state;
    });

    // Subscribe to mode changes
    this.calculatorService.mode$.subscribe(mode => {
      this.currentMode = mode;
    });

    // Subscribe to angle mode changes
    this.calculatorService.angleMode$.subscribe(angleMode => {
      this.currentAngleMode = angleMode;
    });
  }

  setMode(mode: CalculatorMode): void {
    this.calculatorService.setMode(mode);
    if (mode === CalculatorMode.FINANCIAL) {
      this.calculatorService.reset();
    }
  }

  onNumberClick(num: string): void {
    this.calculatorService.inputNumber(num);
  }

  onOperatorClick(operator: string): void {
    this.calculatorService.inputOperation(operator);
  }

  onFunctionClick(func: string): void {
    this.calculatorService.performScientificFunction(func);
  }

  onConstantClick(constant: string): void {
    this.calculatorService.inputConstant(constant);
  }

  onMemoryClick(action: string): void {
    switch (action) {
      case 'mc':
        this.calculatorService.memoryClear();
        break;
      case 'mr':
        this.calculatorService.memoryRecall();
        break;
      case 'm+':
        this.calculatorService.memoryAdd();
        break;
      case 'm-':
        this.calculatorService.memorySubtract();
        break;
    }
  }

  onClear(): void {
    this.calculatorService.reset();
  }

  onBackspace(): void {
    const currentDisplay = this.currentState.display;
    if (currentDisplay.length > 1) {
      this.calculatorService.updateState({
        display: currentDisplay.slice(0, -1)
      });
    } else {
      this.calculatorService.updateState({
        display: '0'
      });
    }
  }

  onDecimalClick(): void {
    this.calculatorService.inputDecimal();
  }

  onEquals(): void {
    this.calculatorService.calculate();
  }

  onAngleToggle(): void {
    this.calculatorService.toggleAngleMode();
  }

  buildExpression(): string {
    const state = this.currentState;
    if (state.previousValue !== null && state.operation) {
      return `${state.previousValue} ${state.operation}`;
    }
    return '';
  }

  toggleHelp(): void {
    this.showHelp = !this.showHelp;
  }
}

bootstrapApplication(App, {
  providers: [
    CalculatorService,
    FinancialService
  ]
});