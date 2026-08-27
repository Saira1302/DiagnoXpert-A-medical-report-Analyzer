function sum(a: number, b: number): number {
  return a + b;
}

describe('typescript sanity check', () => {
  it('handles typed function correctly', () => {
    expect(sum(1, 1)).toBe(2);
  });
});
