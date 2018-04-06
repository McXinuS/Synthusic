import {animate, animateChild, group, query, style, transition, trigger} from '@angular/animations';

export const fadeInOutAnimation = trigger('fadeInOutAnimation', [
  transition(':enter', [
    group([
      style({opacity: 0}),
      animate('150ms ease-in', style({opacity: 1})),
      query('@*', [animateChild()], { optional: true })
    ])
  ]),
  transition(':leave', [
    group([
      style({opacity: 1}),
      animate('150ms ease-out', style({opacity: 0})),
      query('@*', [animateChild()], { optional: true })
    ])
  ])
]);
