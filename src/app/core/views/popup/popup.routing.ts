import { ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';

import {InstrumentPopupDataResolver} from "@core/resolvers";
import {RoutedPopupWindowWrapperComponent} from "@core/views/popup/popup-window-wrapper/routed-popup-window-wrapper/routed-popup-window-wrapper.component";

export const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: 'instrument/:id',
    component: RoutedPopupWindowWrapperComponent,
    resolve: {
      popupData: InstrumentPopupDataResolver
    }
  },
]);
