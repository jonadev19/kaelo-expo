# Testing Strategy — Kaelo Expo

**Date:** 2026-04-01
**Status:** Approved
**Scope:** Full app test coverage (unit + integration), priority on payment/money flows

---

## 1. Objetivo

Establecer una suite de tests que:
1. Proteja los flujos críticos de dinero antes del lanzamiento MVP
2. Exponga como fallos de test los 3 gaps conocidos en wallet (gaps 2 y 3 del `analisis_pendientes.md`)
3. Cubra la lógica de negocio de los 12 features de la app

No se implementa E2E (Detox) en esta fase — se deja para post-MVP por complejidad de setup.

---

## 2. Stack de testing

| Herramienta | Versión | Propósito |
|---|---|---|
| `jest-expo` | latest | Preset oficial para Expo, configura transformers y globals |
| `@testing-library/react-native` | latest | Renderizado de hooks y componentes |
| `@testing-library/jest-native` | latest | Matchers extra (`toBeVisible`, `toHaveTextContent`) |
| `react-test-renderer` | ya en devDeps | Requerido por RNTL |

**Mocks manuales necesarios:**
- `@supabase/supabase-js` — chainable mock (`.from().select().eq()`, `.rpc()`, `.single()`)
- `@stripe/stripe-react-native` — mock de `useStripe`, `initPaymentSheet`, `presentPaymentSheet`
- `expo-location` — mock básico para evitar errores de native modules
- `@rnmapbox/maps` — mock básico

---

## 3. Estructura de archivos

```
src/
  __tests__/
    setup.ts                         ← globals, mock registration, jest config
    mocks/
      supabase.ts                    ← mock chainable del cliente Supabase
      stripe.ts                      ← mock de hooks y métodos de Stripe
      expo-location.ts
      rnmapbox.ts

  features/
    auth/__tests__/
      api.test.ts                    ← login, register, Google Sign-In, signOut
      useAuthStore.test.ts           ← session persistence, guards
    routes/__tests__/
      api.test.ts                    ← list, search, detail, create (5 pasos), RPC calls
      useRoutePurchase.test.ts       ← Edge Function → PaymentSheet → acceso desbloqueado
    orders/__tests__/
      api.test.ts                    ← create (efectivo + tarjeta), cancel, list
    payments/__tests__/
      useOrderPayment.test.ts        ← Stripe flow completo, card declined, rollback
    wallet/__tests__/
      api.test.ts                    ← balance, historial, retiro — 3 tests gap-flagged
    offline/__tests__/
      syncOfflineChanges.test.ts     ← descarga, sync, conflict resolution (server wins)
    metrics/__tests__/
      calculateMetrics.test.ts       ← haversine, velocidad, calorías, interpolación GPS
    businesses/__tests__/
      api.test.ts                    ← list, search, detail
    reviews/__tests__/
      api.test.ts                    ← submit, delete, star rating
    profile/__tests__/
      api.test.ts                    ← fetch, edit, avatar upload
    notifications/__tests__/
      api.test.ts                    ← list, mark read, mark all read, unread count
    favorites/__tests__/
      api.test.ts                    ← toggle save/unsave, list
```

---

## 4. Mapa de cobertura

### 4.1 Tests que deben pasar (flujos correctos)

#### auth
- `signIn` con credenciales válidas llama a `supabase.auth.signInWithPassword`
- `signIn` con credenciales inválidas retorna error y no actualiza el store
- `signUp` crea usuario y perfil
- `signOut` limpia la sesión del store
- Google Sign-In invoca `expo-auth-session` y persiste la sesión

#### routes
- `fetchPublishedRoutes` llama a RPC `get_published_routes` con filtros correctos
- `fetchRouteDetail` llama a RPC `get_route_detail`
- `createRoute` llama a RPC `create_route` con todos los campos del wizard
- `searchRoutes` llama a RPC `search_routes`
- `useRoutePurchase`: flujo exitoso desbloquea la ruta
- `useRoutePurchase`: error en Edge Function no actualiza el estado de compra

#### orders
- `createOrder` (efectivo) llama a RPC `create_order` con `payment_method: 'cash'`
- `createOrder` (tarjeta) llama primero a Stripe y luego a RPC con `payment_intent_id`
- `cancelOrder` llama a RPC `cancel_order`
- `fetchMyOrders` retorna lista de órdenes del usuario

#### payments / useOrderPayment
- Flujo completo: `initPaymentSheet` → `presentPaymentSheet` → orden creada
- Tarjeta declinada: `presentPaymentSheet` falla → orden NO se crea
- Error en creación de PaymentIntent → estado de error, sin orden

#### offline
- `downloadRoute` guarda en AsyncStorage y FileSystem
- `syncOfflineChanges`: si `serverRoute.version > localRoute.version`, actualiza local y notifica
- `syncOfflineChanges`: si versiones iguales, no hace nada

#### metrics / calculateActivityMetrics
- Distancia calculada con fórmula Haversine es correcta (± 1m)
- Velocidad promedio = distancia / tiempo en horas
- Calorías estimadas con peso por defecto cuando no hay perfil
- Gaps de GPS > 60s se marcan como `interpolated: true`

#### businesses, reviews, profile, notifications, favorites
- Cada función de API llama al endpoint/RPC correcto con los parámetros esperados
- Errores de Supabase se propagan correctamente

### 4.2 Tests gap-flagged (deben fallar hasta que se resuelva el gap)

```
// GAP-2: tabla `withdrawals` no existe
it('should create a record in withdrawals table when requesting withdrawal')
it('should return pending withdrawal status from withdrawals table')

// GAP-3: tabla `wallet_transactions` no existe / monthWithdrawals hardcodeado
it('should return real transaction history including withdrawal entries')
it('should return monthWithdrawals from DB, not hardcoded 0')
```

Estos tests se declaran con `test.failing('description', ...)` de Jest. Esto los trata como "expected failure": el CI pasa mientras fallen, y falla cuando pasen (señal de que el gap fue resuelto y hay que remover el `test.failing`). No usar `test.skip` — eso oculta el problema.

---

## 5. Estrategia de mocks

### Supabase mock (chainable)

El mock debe soportar la API fluent de Supabase:

```ts
// src/__tests__/mocks/supabase.ts
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  rpc: jest.fn(),
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  }
}
```

Cada test configura el valor de retorno de `.single()` o `.rpc()` con `mockResolvedValueOnce`.

### Stripe mock

```ts
// src/__tests__/mocks/stripe.ts
jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
    presentPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
  }),
  StripeProvider: ({ children }) => children,
}))
```

---

## 6. Configuración de Jest

En `package.json` se agrega:

```json
"jest": {
  "preset": "jest-expo",
  "setupFilesAfterEach": ["@testing-library/jest-native/extend-expect"],
  "setupFiles": ["./src/__tests__/setup.ts"],
  "moduleNameMapper": {
    "@/(.*)": "<rootDir>/src/$1"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@rnmapbox/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ]
}
```

---

## 7. Prioridades de implementación

| Orden | Feature | Razón |
|---|---|---|
| 1 | Setup + mocks | Todo lo demás depende de esto |
| 2 | `payments/useOrderPayment` | Mayor riesgo financiero |
| 3 | `orders/api` | Flujo principal de monetización |
| 4 | `wallet/api` | Expone gaps 2 y 3 explícitamente |
| 5 | `routes/useRoutePurchase` | Segundo flujo de monetización |
| 6 | `auth` | Base de todos los flujos autenticados |
| 7 | `offline/syncOfflineChanges` | Lógica compleja, edge cases documentados |
| 8 | `metrics/calculateMetrics` | Lógica pura, fácil de testear |
| 9 | `businesses`, `reviews`, `profile`, `notifications`, `favorites` | Cobertura general |

---

## 8. Lo que NO está en scope (esta fase)

- **E2E con Detox** — post-MVP, requiere setup de simulador/emulador
- **Visual regression (Percy/Chromatic)** — post-MVP
- **Load testing (k6)** — post-MVP
- **Tests de componentes UI** — solo se testean hooks y funciones de API, no JSX

---

## Documentos relacionados

- [analisis_pendientes.md](../analisis_pendientes.md) — gaps 2, 3, 4 del wallet
- [04-edge-cases.md](../../04-edge-cases.md) — escenarios de offline y concurrencia
- [05-testing-strategy.md](../../05-testing-strategy.md) — estrategia original del proyecto
