import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngleMode, CalculatorMode } from '../../models/calculator.models';

@Component({
  selector: 'app-calculator-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calculator-display">
      <div class="display-header">
        <span class="mode-indicator" [class]="mode">{{ mode | uppercase }}</span>
        <span class="angle-indicator" *ngIf="mode === 'scientific'">{{ angleMode }}</span>
        <span class="memory-indicator" *ngIf="memoryValue !== 0">M</span>
      </div>
      <div class="display-screen">
        <div class="display-expression" *ngIf="expression">{{ expression }}</div>
        <div class="display-value">{{ displayValue }}</div>
      </div>
    </div>
  `,
  styles: [`
    .calculator-display {
      background: linear-gradient(180deg, rgba(17,24,39,0.9) 0%, rgba(17,24,39,0.7) 100%);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.06);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: var(--glass-shadow);
      min-height: 130px;
    }

    .display-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 12px;
      opacity: 0.8;
    }

    .mode-indicator {
      background: linear-gradient(90deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%);
      padding: 6px 10px;
      border-radius: 999px;
      font-weight: 600;
      box-shadow: var(--shadow-sm);
    }

    .mode-indicator.financial {
      background: var(--accent-green);
    }

    .angle-indicator, .memory-indicator {
      background: rgba(255,255,255,0.1);
      padding: 6px 10px;
      border-radius: 999px;
      font-weight: 500;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .display-screen {
      text-align: right;
    }

    .display-expression {
      font-size: 14px;
      opacity: 0.7;
      margin-bottom: 5px;
      min-height: 16px;
    }

    .display-value {
      font-size: 3rem;
      font-weight: 300;
      line-height: 1.2;
      word-break: break-all;
      min-height: 56px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 6px rgba(0,0,0,0.35);
    }

    @media (max-width: 768px) {
      .display-value {
        font-size: 2.2rem;
      }
    }
  `]
})
export class CalculatorDisplayComponent {
  @Input() displayValue: string = '0';
  @Input() expression: string = '';
  @Input() mode: CalculatorMode = CalculatorMode.SCIENTIFIC;
  @Input() angleMode: AngleMode = AngleMode.DEGREES;
  @Input() memoryValue: number = 0;
}