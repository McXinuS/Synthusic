export class ScoreState {

  readonly BarCount = 20;
  staffViewWidth: number;

  barsOnScreen: number = 0;
  readonly EstimatedBarWidth = 210;
  estimatedStaffWidth: number;

  pageCount: number;
  currentPage: number;
  canGoPrevPage: boolean = false;
  canGoNextPage: boolean = true;
}
