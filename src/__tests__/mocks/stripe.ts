/**
 * Stripe mock factory for jest.mock().
 * Use this in test files that test Stripe-dependent hooks.
 *
 * Usage:
 *   jest.mock('@stripe/stripe-react-native', () =>
 *     require('../../__tests__/mocks/stripe').stripeFactory()
 *   )
 *
 * Then in individual tests, override specific methods:
 *   const { initPaymentSheet, presentPaymentSheet } =
 *     require('@stripe/stripe-react-native').useStripe()
 *   ;(presentPaymentSheet as jest.Mock).mockResolvedValueOnce({ error: { code: 'CardDeclined', message: 'Card declined' } })
 */

export function stripeFactory() {
  const initPaymentSheet = jest.fn().mockResolvedValue({ error: null })
  const presentPaymentSheet = jest.fn().mockResolvedValue({ error: null })

  return {
    useStripe: () => ({ initPaymentSheet, presentPaymentSheet }),
    StripeProvider: ({ children }: { children: any }) => children,
    // Expose mocks for direct override in tests
    __mocks: { initPaymentSheet, presentPaymentSheet },
  }
}