import {
  AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit,
  ViewChild
} from '@angular/core';
import {BaseNote, Instrument, SequencerNote} from '@core/models';
import {
  NoteService,
  SoundService,
  InstrumentService,
  SequencerNoteService,
  WebSocketService,
  KeyboardService
} from '@core/services';
import {KeyChangeMode} from './key';
import {WebSocketMessageType} from '@shared-global/web-socket-message-types';
import {Observable} from "rxjs/Observable";

// TODO use onPush strategy

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyboardComponent implements OnInit, AfterViewChecked {

  instruments$: Observable<Instrument[]>;
  activeInstrument$: Observable<Instrument>;

  notes$: Observable<BaseNote[]>;

  highlights$: Observable<boolean[]>;
  selections$: Observable<boolean[]>;

  miniMode$: Observable<boolean>;

  @ViewChild('keyboardKeys') keyboardKeys: ElementRef;
  keyboardWidth: number;

  constructor(private keyboardService: KeyboardService,
              private changeDetectorRef: ChangeDetectorRef) {
    this.instruments$ = this.keyboardService.instruments$;
    this.activeInstrument$ = this.keyboardService.activeInstrument$;
    this.notes$ = this.keyboardService.notes$;
    this.highlights$ = this.keyboardService.highlights$;
    this.selections$ = this.keyboardService.selections$;
    this.miniMode$ = this.keyboardService.miniMode$;
  }

  ngOnInit() {
  }

  /**
   * Pass keyboard scroll width to keyboard-up component.
   */
  ngAfterViewChecked() {
    // TODO: read more about change detection; is there a way to not produce change detection error?
    let newWidth = this.keyboardKeys.nativeElement.scrollWidth;
    if (this.keyboardWidth !== newWidth) {
      setTimeout(() => {
        this.keyboardWidth = newWidth;
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  onInstrumentChange(instrument: Instrument) {
    this.keyboardService.setActiveInstrument(instrument);
  }

  onKeyStateUpdated(e) {
    this.keyboardService.onKeyStateUpdated(e);
  }

  onMiniChange(e: MouseEvent) {
    this.keyboardService.onMiniChange(e);
  }

  /* Touch events handlers */

  onTouchStart(e: TouchEvent) {
    this.keyboardService.onTouchStart(e);
  }

  onTouchMove(e: TouchEvent) {
    this.keyboardService.onTouchMove(e);
  }

  onTouchEnd(e: TouchEvent) {
    this.keyboardService.onTouchEnd(e);
  }

  onTouchCancel(e: TouchEvent) {
    this.keyboardService.onTouchCancel(e);
  }
}
