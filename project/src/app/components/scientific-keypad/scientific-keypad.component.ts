import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scientific-keypad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scientific-keypad fade-in">
      <!-- Première rangée - Fonctions avancées -->
      <div class="keypad-row">
        <button class="btn-function" (click)="onFunctionClick('2nd')">2nd</button>
        <button class="btn-function" (click)="onConstantClick('pi')">π</button>
        <button class="btn-function" (click)="onConstantClick('e')">e</button>
        <button class="btn-function" (click)="onClear()">C</button>
        <button class="btn-function" (click)="onBackspace()">⌫</button>
      </div>

      <!-- Deuxième rangée - Fonctions trigonométriques -->
      <div class="keypad-row">
        <button class="btn-function" (click)="onFunctionClick('sin')">sin</button>
        <button class="btn-function" (click)="onFunctionClick('cos')">cos</button>
        <button class="btn-function" (click)="onFunctionClick('tan')">tan</button>
        <button class="btn-operator" (click)="onOperatorClick('(')">(</button>
        <button class="btn-operator" (click)="onOperatorClick(')')">)</button>
      </div>

      <!-- Troisième rangée - Fonctions logarithmiques -->
      <div class="keypad-row">
        <button class="btn-function" (click)="onFunctionClick('ln')">ln</button>
        <button class="btn-function" (click)="onFunctionClick('log')">log</button>
        <button class="btn-function" (click)="onFunctionClick('exp')">eˣ</button>
        <button class="btn-operator" (click)="onOperatorClick('%')">%</button>
        <button class="btn-operator" (click)="onOperatorClick('/')" [class.active]="activeOperation === '/'">÷</button>
      </div>

      <!-- Quatrième rangée - Puissances et racines -->
      <div class="keypad-row">
        <button class="btn-function" (click)="onFunctionClick('square')">x²</button>
        <button class="btn-function" (click)="onFunctionClick('cube')">x³</button>
        <button class="btn-function" (click)="onOperatorClick('^')">xʸ</button>
        <button class="btn-number" (click)="onNumberClick('7')">7</button>
        <button class="btn-number" (click)="onNumberClick('8')">8</button>
        <button class="btn-number" (click)="onNumberClick('9')">9</button>
        <button class="btn-operator" (click)="onOperatorClick('*')" [class.active]="activeOperation === '*'">×</button>
      </div>

      <!-- Cinquième rangée -->
      <div class="keypad-row">
        <button class="btn-function" (click)="onFunctionClick('sqrt')">√</button>
        <button class="btn-function" (click)="onFunctionClick('factorial')">x!</button>
        <button class="btn-function" (click)="onFunctionClick('reciprocal')">1/x</button>
        <button class="btn-number" (click)="onNumberClick('4')">4</button>
        <button class="btn-number" (click)="onNumberClick('5')">5</button>
        <button class="btn-number" (click)="onNumberClick('6')">6</button>
        <button class="btn-operator" (click)="onOperatorClick('-')" [class.active]="activeOperation === '-'">−</button>
      </div>

      <!-- Sixième rangée - Mémoire -->
      <div class="keypad-row">
        <button class="btn-memory" (click)="onMemoryClick('mc')">MC</button>
        <button class="btn-memory" (click)="onMemoryClick('mr')">MR</button>
        <button class="btn-memory" (click)="onMemoryClick('m+')">M+</button>
        <button class="btn-number" (click)="onNumberClick('1')">1</button>
        <button class="btn-number" (click)="onNumberClick('2')">2</button>
        <button class="btn-number" (click)="onNumberClick('3')">3</button>
        <button class="btn-operator" (click)="onOperatorClick('+')" [class.active]="activeOperation === '+'">+</button>
      </div>

      <!-- Septième rangée -->
      <div class="keypad-row">
        <button class="btn-function" (click)="onAngleToggle()">{{ angleMode }}</button>
        <button class="btn-memory" (click)="onMemoryClick('m-')">M−</button>
        <button class="btn-function" (click)="onFunctionClick('negate')">±</button>
        <button class="btn-number btn-zero" (click)="onNumberClick('0')">0</button>
        <button class="btn-number" (click)="onDecimalClick()">.</button>
        <button class="btn-equals" (click)="onEquals()">=</button>
      </div>
    </div>
  `,
  styles: [`
    .scientific-keypad {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 20px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(8px);
      border: 1px solid var(--neutral-200);
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
    }

    .keypad-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }

    .keypad-row:nth-child(4) {
      grid-template-columns: repeat(7, 1fr);
    }

    .keypad-row:last-child {
      grid-template-columns: 1fr 1fr 1fr 2fr 1fr 1fr;
    }

    button {
      height: 52px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
      border: 1px solid transparent;
      box-shadow: var(--shadow-sm);
    }

    .btn-number {
      background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
      color: var(--neutral-800);
      border-color: var(--neutral-200);
    }

    .btn-number:hover {
      background: #f0f2f5;
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    .btn-operator {
      background: linear-gradient(180deg, #fb923c 0%, #f97316 100%);
      color: white;
      border-color: #fb923c;
    }

    .btn-operator:hover {
      background: #EA580C;
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    .btn-operator.active {
      background: #DC2626;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .btn-function {
      background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      font-size: 12px;
      border-color: #3b82f6;
    }

    .btn-function:hover {
      background: var(--primary-blue-light);
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    .btn-memory {
      background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
      color: white;
      font-size: 12px;
      border-color: #34d399;
    }

    .btn-memory:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    .btn-equals {
      background: linear-gradient(180deg, #fb923c 0%, #f97316 100%);
      color: white;
      font-size: 18px;
      font-weight: 700;
      border-color: #fb923c;
    }

    .btn-equals:hover {
      background: #EA580C;
      transform: translateY(-1px);
    }

    .btn-zero {
      grid-column: span 2;
    }

    @media (max-width: 768px) {
      .scientific-keypad {
        padding: 15px;
      }

      .keypad-row {
        gap: 6px;
      }

      button {
        height: 45px;
        font-size: 12px;
      }
    }

    @media (max-width: 480px) {
      .keypad-row {
        grid-template-columns: repeat(5, 1fr);
      }

      .keypad-row:nth-child(4) {
        grid-template-columns: repeat(7, 1fr);
      }

      .keypad-row:last-child {
        grid-template-columns: 1fr 1fr 2fr 1fr 1fr;
      }

      button {
        height: 40px;
        font-size: 11px;
      }
    }
  `]
})
export class ScientificKeypadComponent {
  @Input() activeOperation: string | null = null;
  @Input() angleMode: string = 'DEG';

  @Output() numberClick = new EventEmitter<string>();
  @Output() operatorClick = new EventEmitter<string>();
  @Output() functionClick = new EventEmitter<string>();
  @Output() constantClick = new EventEmitter<string>();
  @Output() memoryClick = new EventEmitter<string>();
  @Output() clearClick = new EventEmitter<void>();
  @Output() backspaceClick = new EventEmitter<void>();
  @Output() decimalClick = new EventEmitter<void>();
  @Output() equalsClick = new EventEmitter<void>();
  @Output() angleToggle = new EventEmitter<void>();

  onNumberClick(num: string): void {
    this.numberClick.emit(num);
  }

  onOperatorClick(op: string): void {
    this.operatorClick.emit(op);
  }

  onFunctionClick(func: string): void {
    this.functionClick.emit(func);
  }

  onConstantClick(constant: string): void {
    this.constantClick.emit(constant);
  }

  onMemoryClick(action: string): void {
    this.memoryClick.emit(action);
  }

  onClear(): void {
    this.clearClick.emit();
  }

  onBackspace(): void {
    this.backspaceClick.emit();
  }

  onDecimalClick(): void {
    this.decimalClick.emit();
  }

  onEquals(): void {
    this.equalsClick.emit();
  }

  onAngleToggle(): void {
    this.angleToggle.emit();
  }
}