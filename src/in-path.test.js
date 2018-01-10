import {inPath} from './in-path';

it('throws for missing path', () => {
  expect(() => inPath()).toThrowError(/path must be array of integers/);
});

it('throws for missing base', () => {
  expect(() => inPath([])).toThrowError(/base must be array of integers/);
});
