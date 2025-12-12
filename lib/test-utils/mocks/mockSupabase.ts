/**
 * Mock Supabase Client for Testing
 * Provides test doubles for Supabase database operations
 */

export const createMockSupabaseClient = () => {
  const mockData: Record<string, any[]> = {
    quick_tastings: [],
    quick_tasting_items: [],
    social_posts: [],
    users: [],
  };

  const mockFrom = (table: string) => {
    let currentQuery: any = {
      table,
      filters: [],
      orderBy: null,
      limit: null,
    };

    const executeQuery = () => {
      let results = [...(mockData[table] || [])];

      // Apply filters
      currentQuery.filters.forEach((filter: any) => {
        if (filter.type === 'eq') {
          results = results.filter((item) => item[filter.column] === filter.value);
        } else if (filter.type === 'not') {
          results = results.filter((item) => item[filter.column] !== filter.value);
        } else if (filter.type === 'is') {
          results = results.filter((item) => {
            if (filter.value === null) {
              return item[filter.column] === null;
            }
            return item[filter.column] === filter.value;
          });
        }
      });

      // Apply ordering
      if (currentQuery.orderBy) {
        results.sort((a, b) => {
          const aVal = a[currentQuery.orderBy.column];
          const bVal = b[currentQuery.orderBy.column];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return currentQuery.orderBy.ascending ? comparison : -comparison;
        });
      }

      // Apply limit
      if (currentQuery.limit) {
        results = results.slice(0, currentQuery.limit);
      }

      return results;
    };

    return {
      select: (columns: string = '*') => {
        currentQuery.select = columns;
        return {
          eq: (column: string, value: any) => {
            currentQuery.filters.push({ type: 'eq', column, value });
            return {
              single: () => {
                const results = executeQuery();
                return {
                  data: results[0] || null,
                  error: results.length === 0 ? new Error('No rows found') : null,
                };
              },
              order: (column: string, options?: { ascending?: boolean }) => {
                currentQuery.orderBy = { column, ascending: options?.ascending ?? true };
                return {
                  data: executeQuery(),
                  error: null,
                };
              },
              then: (resolve: (value: any) => void) => {
                resolve({
                  data: executeQuery(),
                  error: null,
                });
              },
            };
          },
          not: (column: string, operator: string, value: any) => {
            currentQuery.filters.push({ type: 'not', column, value });
            return {
              data: executeQuery(),
              error: null,
            };
          },
          is: (column: string, value: any) => {
            currentQuery.filters.push({ type: 'is', column, value });
            return {
              data: executeQuery(),
              error: null,
            };
          },
          order: (column: string, options?: { ascending?: boolean }) => {
            currentQuery.orderBy = { column, ascending: options?.ascending ?? true };
            return {
              limit: (count: number) => {
                currentQuery.limit = count;
                return {
                  data: executeQuery(),
                  error: null,
                };
              },
              data: executeQuery(),
              error: null,
            };
          },
          limit: (count: number) => {
            currentQuery.limit = count;
            return {
              data: executeQuery(),
              error: null,
            };
          },
          then: (resolve: (value: any) => void) => {
            resolve({
              data: executeQuery(),
              error: null,
            });
          },
        };
      },
      insert: (data: any) => {
        const newRecord = Array.isArray(data) ? data : [data];
        newRecord.forEach((record) => {
          const id = record.id || `mock-id-${Date.now()}-${Math.random()}`;
          mockData[table].push({ ...record, id });
        });
        return {
          select: () => ({
            single: () => ({
              data: newRecord[0],
              error: null,
            }),
          }),
        };
      },
      update: (updates: any) => {
        return {
          eq: (column: string, value: any) => ({
            select: () => ({
              single: () => {
                const index = mockData[table].findIndex((item) => item[column] === value);
                if (index >= 0) {
                  mockData[table][index] = { ...mockData[table][index], ...updates };
                  return {
                    data: mockData[table][index],
                    error: null,
                  };
                }
                return {
                  data: null,
                  error: new Error('Record not found'),
                };
              },
            }),
          }),
        };
      },
      delete: () => ({
        eq: (column: string, value: any) => {
          const initialLength = mockData[table].length;
          mockData[table] = mockData[table].filter((item) => item[column] !== value);
          return {
            data: null,
            error: mockData[table].length === initialLength ? new Error('Record not found') : null,
          };
        },
      }),
    };
  };

  const mockAuth = {
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signIn: jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({
      error: null,
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    refreshSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    }),
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    _mockData: mockData,
    _resetMockData: () => {
      Object.keys(mockData).forEach((key) => {
        mockData[key] = [];
      });
    },
  };
};

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;




