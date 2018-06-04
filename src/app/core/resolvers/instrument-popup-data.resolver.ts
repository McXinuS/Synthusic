import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {InstrumentService, PopupService} from "@core/services";
import {InstrumentPopupData, PopupType} from "@core/models";

@Injectable()
export class InstrumentPopupDataResolver implements Resolve<InstrumentPopupData> {

  constructor(private popupService: PopupService,
              private instrumentService: InstrumentService) { }

  resolve(route: ActivatedRouteSnapshot): InstrumentPopupData {
    const id = parseInt(route.params['id']);
    const instrument = this.instrumentService.getInstrument(id);
    const data = this.popupService.getPopupData(PopupType.instrument, instrument);

    // Add to popup service for navigation purpose.
    this.popupService.show(data);

    return data;
  }

}
