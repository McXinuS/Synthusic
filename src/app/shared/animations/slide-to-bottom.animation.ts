import {animate, style, transition, trigger} from '@angular/animations';

export const slideToBottomAnimation = trigger('slideToBottomAnimation', [
  transition(':enter', [
      style({transform: 'translateY(-30px)'}),
      animate('150ms ease-in', style({transform: 'translateY(0px)'}))
    ]
  ),
  transition(':leave', [
      style({transform: 'translateY(0px)'}),
      animate('150ms ease-out', style({transform: 'translateY(30px)'}))
    ]
  )
]);
