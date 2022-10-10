import type {
  CssValue,
  SupportShorthandProperties,
  SupportedCssProperties,
} from '../types/style';
import type { AndArray } from '../types/utils';
import { generateStyles } from './generateStyles';
import { normalizeShorthandProperty } from './normalizeShorthandProperty';

type OverflowStyle = Pick<SupportedCssProperties, 'overflowX' | 'overflowY'>;

export const resolveShortHandStyle = (
  _property: keyof SupportShorthandProperties,
  styleValue: AndArray<CssValue>,
): SupportedCssProperties => {
  const values = Array.isArray(styleValue)
    ? (styleValue as CssValue[]).map((v) => v.toString())
    : styleValue
        .toString()
        .split(' ')
        .filter((v) => v !== '');

  const property = normalizeShorthandProperty(_property);

  if (property === 'margin' || property === 'padding') {
    const style = generateStyles(property, '', ...values);
    return style;
  } else if (property === 'gap') {
    const [firstValue, secondValue = firstValue] = values;
    return {
      columnGap: firstValue,
      rowGap: secondValue,
    };
  } else if (property === 'inset') {
    const [
      firstValue,
      secondValue = firstValue,
      thirdValue = firstValue,
      fourthValue = secondValue,
    ] = values;
    return {
      top: firstValue,
      right: secondValue,
      bottom: thirdValue,
      left: fourthValue,
    };
  } else if (property === 'borderRadius') {
    const [
      firstValue,
      secondValue = firstValue,
      thirdValue = firstValue,
      fourthValue = secondValue,
    ] = values;
    return {
      borderTopLeftRadius: firstValue,
      borderTopRightRadius: secondValue,
      borderBottomRightRadius: thirdValue,
      borderBottomLeftRadius: fourthValue,
    };
  } else if (property === 'overflow') {
    const [firstValue, secondValue = firstValue] = values;
    return {
      overflowX: firstValue,
      overflowY: secondValue,
    } as OverflowStyle;
  } else if (property === 'outline') {
    const [firstValue, secondValue, thirdValue] = values;
    return {
      outlineWidth: firstValue,
      ...(secondValue && { outlineColor: secondValue }),
      ...(thirdValue && { outlineStyle: thirdValue }),
    };
  } else {
    return {};
  }
};
