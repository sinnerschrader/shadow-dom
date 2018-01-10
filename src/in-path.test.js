import {inPath} from './in-path';

it('returns target', () => {
  expect(() => inPath()).toThrowError(/path must be array of integers/);
});

