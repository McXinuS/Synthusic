import {ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {CreateId} from "../../utils/id-generator";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
  selector: 'input-slider',
  templateUrl: './input-slider.component.html',
  styleUrls: ['./input-slider.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputSliderComponent),
    multi: true
  }]
})
export class InputSliderComponent implements ControlValueAccessor{

  @Input() description: string = '';
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;

  // Fired when input[range]'s event is fired
  @Output() rangeInput: EventEmitter<number> = new EventEmitter<number>();
  @Output() rangeChange: EventEmitter<number> = new EventEmitter<number>();

  labelId: string;

  isDisabled: boolean;
  @Input('isDisabled')
  set _isDisabled(dis: boolean) {
    this.setDisabledState(dis);
  }

  constructor() {
    // initialize ID of the description label
    this.labelId = 'label-' + CreateId();
  }

  private parseNewValue(newValue): number {
    let newValueType = typeof newValue;

    if (newValueType === 'string') {
      // remove commas to make number parsable for some locales: '1,234.56' to '1234.56
      newValue = parseFloat(newValue.replace(/,/g, ''));
      if (isNaN(newValue)) {
        throw new Error(`Cannot convert string '${newValue}' to a number`);
      }
    }
    else if (newValueType !== 'number')
      throw new Error(`Wrong type of argument: expected number or string, got ${newValueType}`);

    return newValue;
  }

  onRangeInput(newValue) {
    newValue = this.parseNewValue(newValue);
    if (this.value === newValue) return;

    this.value = newValue;
    this.rangeInput.emit(newValue);
  }

  onRangeChange(newValue) {
    newValue = this.parseNewValue(newValue);
    // No need to check value because it'll always be assigned
    // before during 'onRangeInput' event
    this.value = newValue;
    this.rangeChange.emit(newValue);
  }

  /*** ControlValueAccessor implementation ***/

    //Placeholders for the callbacks which are later provided
    //by the Control Value Accessor
  private onTouchedCallback: () => void = () => {
  };
  private onChangeCallback: (_: any) => void = () => {
  };

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

  // TODO: not working: doesn't affect DOM
  setDisabledState(isDisabled: boolean): void {
    // Convert boolean value to either 'true' ot 'null' because for HTML element
    //  attribute everything will be converted to string except null
    this.isDisabled = isDisabled ? true : null;
  }
}
