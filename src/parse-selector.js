import selectorParser from 'postcss-selector-parser';

export function parseSelector(selector) {
  const result = [];

  const transform = selectors => {
    selectors.last.nodes.forEach(node => {
      result.push(node);
    });
  };

  selectorParser(transform).processSync(selector);
  return result;
}
