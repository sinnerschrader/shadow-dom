export function compare(a, b) {
  for (let i = 0; i < a.length; i += 1) {
    const ai = co(a[i]);
    const bi = co(b[i]);

    if (ai === bi) {
      continue;
    }
    if (ai > bi) {
      return -1;
    }
    if (ai < bi) {
      return 1;
    }
  }

  return 0;
}

function co(candidate) {
  return typeof candidate === 'undefined' ? -1 : candidate;
}
