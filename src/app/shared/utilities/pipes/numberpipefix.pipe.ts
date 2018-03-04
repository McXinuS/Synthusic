import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberPipeFix'
})
export class NumberpipefixPipe implements PipeTransform {

  transform(value: string, args?: any): string {
    if (!value) {
      return '';
    }
    return value.replace(',', '');
  }

}
