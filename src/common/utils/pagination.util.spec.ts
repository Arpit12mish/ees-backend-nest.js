import { getPaginationParams, paginate } from './pagination.util';

describe('pagination utilities', () => {
  it('caps limit and normalizes page values', () => {
    expect(getPaginationParams(0, 250)).toEqual({
      page: 1,
      limit: 100,
      skip: 0,
      take: 100,
    });
  });

  it('wraps paginated results with metadata', () => {
    expect(paginate(['a', 'b'], 5, 2, 2)).toEqual({
      items: ['a', 'b'],
      meta: { page: 2, limit: 2, total: 5, totalPages: 3 },
    });
  });
});
