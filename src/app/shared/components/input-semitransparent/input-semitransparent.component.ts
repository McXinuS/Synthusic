import {
  ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnInit, Output,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-input-semitransparent',
  templateUrl: './input-semitransparent.component.html',
  styleUrls: ['./input-semitransparent.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputSemitransparentComponent),
    multi: true
  }]
})
export class InputSemitransparentComponent implements OnInit, ControlValueAccessor {

  // String attributes

  // @Input() minLength: number = 0;
  @Input() maxLength: number = -1;
  @Input() placeholder: string = '';
  @Input() autocomplete: string;

  // Number attributes

  @Input() min: number = 0;
  @Input() max: number = 100;

  numberPipeValue: string = '1.2-2';

  step: number = 1;

  @Input('step')
  set _step(step: number) {
    this.step = step;
    this.updateNumberPipeValue();
  }

  // Common attributes

  @Input() type: string;
  @Input() isDisabled: boolean;
  @Input() styles: object;
  @Input() name: string;
  @Input() labelId: string;   // to be used with input-slider component

  // ngModel value
  _value: string | number;
  get value(): any {
    return this._value;
  };

  set value(value: any) {
    if (value !== this._value) {
      this._value = value;
      this.onChangeCallback(value);
    }
  }

  // Placeholders for the callbacks which are later provided by the Control Value Accessor
  private onTouchedCallback: () => void = () => {
  };
  private onChangeCallback: (_: any) => void = () => {
  };

  constructor() {
  }

  ngOnInit() {
  }

  private updateNumberPipeValue() {
    if (!this.step) return;

    let fraction = this.step.toString().split('.')[1] || [];
    let fractionsCount = fraction.length;
    this.numberPipeValue = `1.${fractionsCount}-${fractionsCount}`;
  }

  /*** ControlValueAccessor implementation ***/

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: string | number): void {
    if (value !== this._value) {
      this._value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  // TODO: test
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
