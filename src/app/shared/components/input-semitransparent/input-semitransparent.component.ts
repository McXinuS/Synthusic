import {
  AfterViewInit,
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output,
  SimpleChanges, ViewChild,
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
export class InputSemitransparentComponent implements OnInit, AfterViewInit, ControlValueAccessor {

  // String attributes

  // @Input() minLength: number = 0;
  @Input() maxLength: number = -1;
  @Input() placeholder: string = '';
  @Input() autocomplete: string;

  // Number attributes

  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() integer: boolean = false;

  numberPipeValue: string = '1.2-2';

  step: number = 1;

  @Input('step')
  set _step(step: number) {
    this.step = step;
    this.updateNumberPipeValue();
  }

  // Common attributes

  @Input() type: string = 'text';
  @Input() isDisabled: boolean;
  @Input() styles: object;
  @Input() name: string;
  @Input() labelId: string;           // to be used with input-slider component
  @Input() dotted: boolean = false;   // underlined with dots

  private dotsDivStyle: string;

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
    this.updateNumberPipeValue();
  }

  ngAfterViewInit() {
    this.updateDotsWidth();
  }


  private updateNumberPipeValue() {
    if (this.integer) {
      this.numberPipeValue = '1.0-0';
      return;
    }

    let fraction = this.step.toString().split('.')[1] || [];
    let fractionsCount = fraction.length;
    this.numberPipeValue = `1.${fractionsCount}-${fractionsCount}`;
  }

  private updateDotsWidth() {
    let marginLeft = 0;
    let marginRight = 0;

    if (this.type == 'number') {
      marginRight += 20;
    }

    this.dotsDivStyle = `margin-left: ${marginLeft}px; width: calc(100% - ${marginRight}px);`;
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
