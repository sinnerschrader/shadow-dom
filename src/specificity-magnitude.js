import specificity from 'specificity';

export function specificityMagnitude(selectorText) {
  const [{specificityArray: [, spec]}] = specificity.calculate(selectorText);
  return spec;
}
