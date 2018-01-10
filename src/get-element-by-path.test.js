import {getElementByPath} from './get-element-by-path';

it('throws for missing path', () => {
  expect(() => getElementByPath()).toThrowError(/path must be array of positive integers/);
});
