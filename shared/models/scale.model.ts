export class Scale {
  id: number;
  name: string;
  notes: string[];
  accidentalPlaceholder: string;  // ex. 'f', 's'
  /**
   * Sign that is shown to user. May not be readable in some fonts
   * ex. '♭', '♯' or some unicode character
   */
  accidentalSign: string;
  accidentalStep: number;
}
