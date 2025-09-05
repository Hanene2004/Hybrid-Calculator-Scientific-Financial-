import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CalculatorState, CalculatorMode, AngleMode } from '../models/calculator.models';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  private initialState: CalculatorState = {
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
    memory: 0
  };

  private stateSubject = new BehaviorSubject<CalculatorState>(this.initialState);
  private modeSubject = new BehaviorSubject<CalculatorMode>(CalculatorMode.SCIENTIFIC);
  private angleModeSubject = new BehaviorSubject<AngleMode>(AngleMode.DEGREES);

  public state$ = this.stateSubject.asObservable();
  public mode$ = this.modeSubject.asObservable();
  public angleMode$ = this.angleModeSubject.asObservable();

  getCurrentState(): CalculatorState {
    return this.stateSubject.value;
  }

  getCurrentMode(): CalculatorMode {
    return this.modeSubject.value;
  }

  getCurrentAngleMode(): AngleMode {
    return this.angleModeSubject.value;
  }

  setMode(mode: CalculatorMode): void {
    this.modeSubject.next(mode);
  }

  toggleAngleMode(): void {
    const currentMode = this.angleModeSubject.value;
    this.angleModeSubject.next(
      currentMode === AngleMode.DEGREES ? AngleMode.RADIANS : AngleMode.DEGREES
    );
  }

  updateState(updates: Partial<CalculatorState>): void {
    const currentState = this.getCurrentState();
    const newState = { ...currentState, ...updates };
    this.stateSubject.next(newState);
  }

  reset(): void {
    this.stateSubject.next(this.initialState);
  }

  inputNumber(num: string): void {
    const state = this.getCurrentState();
    
    if (state.waitingForOperand) {
      this.updateState({
        display: num,
        waitingForOperand: false
      });
    } else {
      this.updateState({
        display: state.display === '0' ? num : state.display + num
      });
    }
  }

  inputOperation(nextOperation: string): void {
    const state = this.getCurrentState();
    const inputValue = parseFloat(state.display);

    if (state.previousValue === null) {
      this.updateState({
        previousValue: inputValue,
        waitingForOperand: true,
        operation: nextOperation
      });
    } else if (state.operation && !state.waitingForOperand) {
      const currentValue = state.previousValue || 0;
      const newValue = this.performCalculation(currentValue, inputValue, state.operation);

      this.updateState({
        display: String(newValue),
        previousValue: newValue,
        waitingForOperand: true,
        operation: nextOperation
      });
    } else {
      this.updateState({
        operation: nextOperation,
        waitingForOperand: true
      });
    }
  }

  calculate(): void {
    const state = this.getCurrentState();
    const inputValue = parseFloat(state.display);

    if (state.previousValue !== null && state.operation) {
      const newValue = this.performCalculation(state.previousValue, inputValue, state.operation);
      
      this.updateState({
        display: String(newValue),
        previousValue: null,
        operation: null,
        waitingForOperand: true
      });
    }
  }

  private performCalculation(firstOperand: number, secondOperand: number, operation: string): number {
    switch (operation) {
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '*': return firstOperand * secondOperand;
      case '/': return secondOperand !== 0 ? firstOperand / secondOperand : 0;
      case '%': return firstOperand % secondOperand;
      case '^': return Math.pow(firstOperand, secondOperand);
      default: return secondOperand;
    }
  }

  // Fonctions scientifiques
  performScientificFunction(func: string): void {
    const state = this.getCurrentState();
    const value = parseFloat(state.display);
    let result: number;
    const angleMode = this.getCurrentAngleMode();

    switch (func) {
      case 'sin':
        result = Math.sin(angleMode === AngleMode.DEGREES ? value * Math.PI / 180 : value);
        break;
      case 'cos':
        result = Math.cos(angleMode === AngleMode.DEGREES ? value * Math.PI / 180 : value);
        break;
      case 'tan':
        result = Math.tan(angleMode === AngleMode.DEGREES ? value * Math.PI / 180 : value);
        break;
      case 'asin':
        result = Math.asin(value);
        if (angleMode === AngleMode.DEGREES) result = result * 180 / Math.PI;
        break;
      case 'acos':
        result = Math.acos(value);
        if (angleMode === AngleMode.DEGREES) result = result * 180 / Math.PI;
        break;
      case 'atan':
        result = Math.atan(value);
        if (angleMode === AngleMode.DEGREES) result = result * 180 / Math.PI;
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'exp':
        result = Math.exp(value);
        break;
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'square':
        result = value * value;
        break;
      case 'cube':
        result = value * value * value;
        break;
      case 'factorial':
        result = this.factorial(Math.floor(Math.abs(value)));
        break;
      case 'reciprocal':
        result = value !== 0 ? 1 / value : 0;
        break;
      case 'negate':
        result = -value;
        break;
      case 'abs':
        result = Math.abs(value);
        break;
      default:
        return;
    }

    this.updateState({
      display: this.formatNumber(result),
      waitingForOperand: true
    });
  }

  private factorial(n: number): number {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  // Gestion de la mémoire
  memoryAdd(): void {
    const state = this.getCurrentState();
    const value = parseFloat(state.display);
    this.updateState({ memory: state.memory + value });
  }

  memorySubtract(): void {
    const state = this.getCurrentState();
    const value = parseFloat(state.display);
    this.updateState({ memory: state.memory - value });
  }

  memoryRecall(): void {
    const state = this.getCurrentState();
    this.updateState({
      display: this.formatNumber(state.memory),
      waitingForOperand: true
    });
  }

  memoryClear(): void {
    this.updateState({ memory: 0 });
  }

  inputDecimal(): void {
    const state = this.getCurrentState();
    
    if (state.waitingForOperand) {
      this.updateState({
        display: '0.',
        waitingForOperand: false
      });
    } else if (state.display.indexOf('.') === -1) {
      this.updateState({
        display: state.display + '.'
      });
    }
  }

  inputConstant(constant: string): void {
    let value: number;
    
    switch (constant) {
      case 'pi':
        value = Math.PI;
        break;
      case 'e':
        value = Math.E;
        break;
      default:
        return;
    }

    this.updateState({
      display: this.formatNumber(value),
      waitingForOperand: true
    });
  }

  private formatNumber(num: number): string {
    if (isNaN(num) || !isFinite(num)) {
      return 'Erreur';
    }

    // Limiter la précision pour éviter les erreurs de virgule flottante
    const rounded = Math.round(num * 1000000000000) / 1000000000000;
    
    // Utiliser la notation scientifique pour les très grands ou très petits nombres
    if (Math.abs(rounded) >= 1e15 || (Math.abs(rounded) < 1e-10 && rounded !== 0)) {
      return rounded.toExponential(10);
    }

    return String(rounded);
  }
}