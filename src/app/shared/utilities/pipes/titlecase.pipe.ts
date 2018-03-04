import {Pipe, PipeTransform} from '@angular/core';

/*
 * Changes the case of the first letter of a given number of words in a string.
 * // https://gist.github.com/apkostka/a42b2f23df033872ae406549ab1a1c2e
 */
@Pipe({name: 'titleCase'})
export class TitleCase implements PipeTransform {
  transform(input: string, length: number): string {
    return input.length > 0 ? input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1).toLowerCase() )) : '';
  }
}
