import {
  animate, query,
  style,
  transition,
  trigger
} from '@angular/animations';

/**
 * Fade in from the left top corner; fade out to the right top corner.
 */
export const fadeCornerAnimation = trigger('fadeCornerAnimation', [
  transition('* => *', [
    query(':enter', [
      style({
        'transform-origin': 'top left',
        transform: 'scaleY(0.95)',
        opacity: 0
      }),
      animate(
        '150ms ease-in',
        style({transform: 'scaleY(1)', opacity: 1})
      )
    ], { optional: true }),
    query(':leave', [
      style({
        'transform-origin': 'top right',
        transform: 'scaleY(1)',
        opacity: 1
      }),
      animate(
        '150ms ease-out',
        style({transform: 'scaleY(0.95)', opacity: 0})
      )
    ], { optional: true })
  ])
]);
