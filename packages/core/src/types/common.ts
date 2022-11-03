import type { ClassName } from '../ClassName';

export type CssValue = string | number | undefined;

export type NestedChar =
  | ':'
  | '&'
  | ' '
  | '@'
  | ','
  | '>'
  | '~'
  | '+'
  | '['
  | '.'
  | '#';

export type Classes<K extends string> = Record<K, string>;
export type ClassesObject<K extends string> = Record<K, ClassName['object']>;

export type Selectors = {
  nested: string;
  atRules: string[];
};