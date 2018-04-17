import { NumberpipefixPipe, SafePipe, TitleCase } from './pipes'
import {EnumToArrayPipe} from "@shared/utilities/pipes";
import {ClickOutsideDirective} from "@shared/utilities/click-outside.directive";

export const UTILITIES = [
  NumberpipefixPipe,
  SafePipe,
  TitleCase,
  EnumToArrayPipe,
  ClickOutsideDirective,
];

export * from './helpers'
