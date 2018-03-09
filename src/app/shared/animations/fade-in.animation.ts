import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';

export const fadeInAnimation = trigger(
  'fadeIn',
  [
    transition(
      ':enter', [
        style({
          'transform-origin': 'top left',
          transform: 'scaleY(0.95)',
          opacity: 0
        }),
        animate(
          '150ms ease-in',
          style({transform: 'scaleY(1)', opacity: 1})
        )
      ]
    ),
    transition(
      ':leave', [
        style({
          'transform-origin': 'top right',
          transform: 'scaleY(1)',
          opacity: 1
        }),
        animate(
          '150ms ease-out',
          style({transform: 'scaleY(0.95)', opacity: 0})
        )
      ]
    )]
);

/*
export const fadeInAnimation = trigger(
  'fadeIn',
  [
    state('void', style({opacity: 0, transform: 'translateY(-20rem)'})),
    transition(':enter', [
      animate(
        '3000ms ease-in',
        style({
          opacity: 1,
          transform: 'translateY(0rem)'
        })
      )
    ]),
    transition(':leave', [
      animate(
        '3000ms ease-out',
        style({
          opacity: 0,
          transform: 'translateY(-20rem)'
        })
      )
    ])
  ]
);
*/
