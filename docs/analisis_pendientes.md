# 📊 Estado del Proyecto Kaelo Expo — Análisis Profundo

**Fecha:** 2026-03-22  
**Versión:** 4.1 (post-implementación Gap 1)

---

## ✅ Flujos 100% completos (UI → API → DB → respuesta)

| Flujo | Evidencia |
|-------|-----------|
| **Auth** (login, register, Google Sign-In) | Supabase Auth, guards, persistencia |
| **Explorar rutas** (mapa + lista + filtros) | `get_published_routes` RPC, filtros por dificultad/terreno/distancia |
| **Detalle de ruta** | `get_route_detail` RPC, stats, mapa, waypoints, reviews, negocios, premium gate |
| **Crear ruta** (5 pasos) | Draw → Waypoints → Details → Businesses → Review. Image upload, slug gen, `create_route` RPC |
| **Buscar rutas** | `search_routes` RPC, búsqueda por nombre/descripción/municipio |
| **Comprar ruta premium (Stripe)** | `useRoutePurchase` → Edge Function → Stripe PaymentIntent → `initPaymentSheet` + `presentPaymentSheet` → confirmación. Split 85/15 |
| **Premium Preview** | Mapa 20% del track, 3 waypoints max, PremiumGate CTA, overlay candado |
| **Navegación GPS** | Mapbox Directions, tracking real-time, background location, instrucciones, GPS signal, ETA, velocidad |
| **Activity Tracking + persistencia** | `calculateActivityMetrics()` → `saveRouteCompletion()` → tabla `route_completions`. Haversine, speed, calorías, GeoJSON path |
| **Negocios** (list + search + detail) | 7 categorías, productos, horarios, galería, mini mapa, WhatsApp |
| **Órdenes** (crear + listar + cancelar) | CartScreen → `create_order` RPC → MyOrdersScreen → `cancel_order` RPC |
| **Favoritos** | Toggle save/unsave, lista de guardados |
| **Reviews** | Submit, delete, star rating, unificadas para rutas y negocios |
| **Métricas** | Dashboard con 6 stat cards, puntos, logros/achievements, `user_dashboard_summary` view |
| **Perfil** (ver + editar) | Stats reales, avatar, edición, menú settings |
| **Notificaciones** | Lista, mark read, mark all read, unread count |
| **Offline** | AsyncStorage + FileSystem + Mapbox `offlineManager.createPack`, cover image download |
| **Wallet** | Balance, stats de ventas, resumen mensual, historial, solicitar retiro |
| **Dark/Light theme** | `useTheme` hook + `themeStore` |
| **Route monetization toggle** | `PricingToggle` en Step3 del wizard |

---

## ❌ Lo que EN VERDAD falta (6 gaps restantes — 1 resuelto)

### 🔴 Gaps críticos (afectan monetización)

#### ~~Gap 1: Checkout de órdenes sin método de pago~~ ✅ RESUELTO
- **Implementado el 2026-03-22**
- `PaymentMethodSelector` integrado en `CartScreen`
- Flujo: efectivo → orden directa, tarjeta → Stripe PaymentSheet via `createOrderPaymentIntent`
- Hook `useOrderPayment` creado para orquestar el flujo de Stripe
- Botón cambia dinámicamente: "Confirmar Pedido" vs "Pagar con Tarjeta"
- Migración DB: eliminado overload viejo de `create_order` (5 params)
- **Archivos modificados:** `CartScreen.tsx`, `types.ts`, `api.ts`
- **Archivo creado:** `useOrderPayment.ts`

#### Gap 2: No hay tabla `withdrawals` — retiros simulados
- `requestWithdrawal()` deduce balance del perfil y crea una **notificación** como registro
- `monthWithdrawals` hardcodeado a `0`, `pendingWithdrawal` a `null`
- No hay historial real de retiros ni proceso de aprobación
- **Archivo:** `src/features/wallet/api.ts` (líneas 152-153, 162-199)
- **Esfuerzo:** ~1 día

#### Gap 3: Wallet sin transacciones reales
- No existe tabla `wallet_transactions`
- Las transacciones se **derivan** de `route_purchases` (buyer + creator)
- Los retiros no aparecen en el historial
- **Archivo:** `src/features/wallet/api.ts` (líneas 31-90)
- **Esfuerzo:** ~1 día

#### Gap 4: No hay Stripe Connect
- No se pueden hacer transferencias reales de dinero a creadores
- Los retiros solo envían notificación, no mueven dinero
- **Esfuerzo:** ~3-5 días

### 🟡 Gaps menores

#### Gap 5: Falta pantalla de historial de actividades
- API `fetchRecentActivity()` existe y lee de `route_completions`
- Falta la **pantalla UI** que muestre la lista de rutas completadas
- **Archivo:** `src/features/metrics/api.ts` (líneas 44-64)
- **Esfuerzo:** ~1 día

#### Gap 6: Órdenes sin paginación
- `fetchMyOrders` carga todas las órdenes de una vez
- `FlatList` sin `onEndReached` / infinite scroll
- Sin filtros por estado o fecha
- **Esfuerzo:** ~0.5 día

#### Gap 7: Push notifications no verificadas
- `registerPushToken` guarda token en `profiles.push_token` (con fallback a AsyncStorage)
- Edge Function `send-push-notification` existe pero no verificada en producción
- Las notificaciones in-app funcionan correctamente
- **Esfuerzo:** ~1 día

### ⚪ Features P2 (no necesarios para MVP)

| Feature | Estado |
|---------|--------|
| Route Sharing (deeplinks) | No implementado |
| Performance Comparison | No implementado |
| Personal Records | No implementado (tablas pueden existir en migrations) |
| Business Web Dashboard (RF-101 a RF-108) | Proyecto separado, no implementado |

---

## 📋 Plan de acción priorizado

| # | Gap | Esfuerzo | Prioridad | Estado |
|---|-----|----------|-----------|--------|
| 1 | ~~Integrar `PaymentMethodSelector` en `CartScreen` + Stripe para órdenes~~ | ~~1-2 días~~ | 🔴 Crítico | ✅ Hecho |
| 2 | Crear tabla `withdrawals` + migrar lógica de retiros | 1 día | 🔴 Crítico | ⬜ Pendiente |
| 3 | Crear tabla `wallet_transactions` o incluir retiros en historial | 1 día | 🔴 Crítico | ⬜ Pendiente |
| 4 | Stripe Connect para transferencias reales a creadores | 3-5 días | 🔴 Crítico (puede diferirse a post-launch) | ⬜ Pendiente |
| 5 | Pantalla de historial de actividades | 1 día | 🟡 Importante | ⬜ Pendiente |
| 6 | Paginación en MyOrders | 0.5 día | 🟡 Mejora | ⬜ Pendiente |
| 7 | Verificar push notifications en producción | 1 día | 🟡 Importante | ⬜ Pendiente |

**Total restante para MVP: ~1-1.5 semanas** (gaps 2-5 + gap 7)

---

## 📚 Documentos relacionados

- [01 - Project Overview](./01-project-overview.md)
- [02 - Requirements](./02-requirements.md)
- [03 - Architecture](./03-architecture.md)
