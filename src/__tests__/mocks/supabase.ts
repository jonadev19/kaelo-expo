/**
 * Creates a mock Supabase query builder that:
 * - Is chainable: every method returns the builder itself
 * - Is awaitable: the builder has `then`/`catch` so `await builder` works
 * - Has terminal methods (.single, .maybeSingle) that return resolved Promises
 *
 * Usage in tests:
 *   jest.mocked(supabase.from).mockReturnValue(
 *     createBuilder({ data: { id: '1' }, error: null })
 *   )
 */
export function createBuilder(resolvedValue: {
  data?: any
  error?: any
  count?: number
}) {
  const builder: Record<string, any> = {}

  // Chainable methods — each returns the builder for further chaining
  const chain = () => jest.fn(() => builder)
  builder.select = chain()
  builder.insert = chain()
  builder.update = chain()
  builder.upsert = chain()
  builder.delete = chain()
  builder.eq = chain()
  builder.neq = chain()
  builder.in = chain()
  builder.gte = chain()
  builder.lte = chain()
  builder.order = chain()
  builder.limit = chain()

  // Terminal methods — return a resolved Promise
  builder.single = jest.fn(() => Promise.resolve(resolvedValue))
  builder.maybeSingle = jest.fn(() => Promise.resolve(resolvedValue))

  // Make the builder itself awaitable (for queries that don't call .single())
  // e.g.: const { data, error } = await supabase.from('x').select().eq().order()
  builder.then = (
    onFulfilled: (v: typeof resolvedValue) => any,
    onRejected?: (e: any) => any,
  ) => Promise.resolve(resolvedValue).then(onFulfilled, onRejected)
  builder.catch = (onRejected: (e: any) => any) =>
    Promise.resolve(resolvedValue).catch(onRejected)

  return builder
}

/**
 * The auth mock shape used inside jest.mock('@/lib/supabase', ...) factories.
 * Copy this into each test file that needs auth mocking.
 *
 * Example:
 *   jest.mock('@/lib/supabase', () => ({
 *     supabase: {
 *       ...require('../../__tests__/mocks/supabase').mockSupabaseBase,
 *     }
 *   }))
 */
export const mockAuthShape = {
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } },
  })),
  signInWithOAuth: jest.fn(),
  setSession: jest.fn(),
  resetPasswordForEmail: jest.fn(),
}