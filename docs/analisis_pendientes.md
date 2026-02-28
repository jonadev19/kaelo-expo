# 📊 Estado del Proyecto Kaelo Expo — Qué Falta por Implementar

**Fecha:** 2026-02-28  
**Versión del análisis:** 2.0

---

## ~~🚨 Problema Crítico: Conflictos de Merge Sin Resolver~~ ✅ RESUELTO

> Los conflictos de merge que existían en v1.0 del análisis han sido **completamente resueltos**. No se encontraron marcadores `<<<<<<< HEAD` en ningún archivo del proyecto.

---

## ✅ Lo que YA está implementado

| Módulo | Estado | Detalle |
|--------|--------|---------|
| **Auth** (login/register) | ✅ Funcional | Supabase Auth con auth guards, login, registro, Google Sign-In |
| **Rutas** (discovery, detail, search) | ✅ APIs listas | `fetchPublishedRoutes`, `fetchRouteDetail`, `searchRoutes` con RPCs de Supabase |
| **Crear Rutas** (5-step wizard) | ✅ Screens creadas | Draw → Waypoints → Details → Businesses → Review |
| **Negocios** (list, detail, search) | ✅ Funcional | `fetchBusinesses`, `searchBusinesses`, `fetchBusinessDetail`. 7 categorías (restaurante, cafetería, tienda, taller, hospedaje, farmacia, otro). Incluye productos, horarios, galería de fotos, mini mapa Mapbox, contacto WhatsApp/teléfono |
| **Órdenes** (crear, listar, cancelar) | ✅ APIs listas | `createOrder`, `fetchMyOrders`, `cancelOrder`. Cart con store Zustand |
| **Carrito** | ✅ Funcional | `CartScreen` + `useCartStore` con barra flotante en detalle de negocio |
| **Favoritos** (guardar rutas) | ✅ CRUD completo | `fetchSavedRoutes`, `toggleSaveRoute`, `checkRouteSaved` |
| **Reviews** (rutas y negocios) | ✅ CRUD completo | `fetchRouteReviews`, `submitReview`, `fetchBusinessReviews`, `deleteReview` |
| **Métricas personales** | ✅ APIs listas | Dashboard, achievements, activity history |
| **Perfil** (view, edit, stats) | ✅ APIs listas | `fetchProfile`, `updateProfile`, `fetchProfileStats` |
| **Navegación GPS** | ✅ Screen creada | `NavigationScreen` (modal fullscreen) |
| **Tema dark/light** | ✅ Funcional | `useTheme` hook |
| **React Query** | ✅ Configurado | `QueryClientProvider` en root layout |
| **DB Migrations** (19 archivos) | ✅ Creadas | En `migrations/reference/` |
| **Pagos con Stripe** | ✅ Implementado | Edge Functions (`create-payment-intent`, `stripe-webhook`). APIs: `createRoutePaymentIntent`, `createOrderPaymentIntent`, `confirmRoutePurchase`, `checkRoutePurchased`, `fetchMyPurchases`. Split 85% creator / 15% plataforma |
| **Notificaciones** | ✅ Implementado | API completa: `registerPushToken`, `fetchNotifications`, `fetchUnreadCount`, `markNotificationRead`, `markAllNotificationsRead`. Edge Function `send-push-notification`. Screen con FlatList, mark all read, navegación contextual |
| **Offline Route Download** | ✅ Implementado | `saveRouteOffline`, `getOfflineRoute`, `getAllOfflineRoutes`, `removeOfflineRoute`, `clearAllOfflineData`. Usa AsyncStorage + expo-file-system para imágenes + Mapbox `offlineManager.createPack` para tiles |
| **Wallet / Balance** | ✅ Implementado | `fetchWalletBalance`, `fetchWalletTransactions`, `fetchWalletSummary`, `requestWithdrawal`. Deriva transacciones de `route_purchases`. Retiros con mínimo $500 MXN, notificación al solicitar |

---

## ❌ Lo que FALTA por implementar

### Prioridad P0 (Crítico para MVP)

| Req. ID | Feature | Estado |
|---------|---------|--------|
| RF-010 | **Location Tracking (real-time)** — Seguimiento GPS durante navegación | ⚠️ Screen existe pero falta verificar si tracking real funciona |
| RF-020 | **Route Purchase UI Flow** — Flujo completo de compra de rutas premium en la UI | ⚠️ API de pagos existe, falta integrar PaymentSheet de Stripe en pantalla de detalle de ruta |
| RF-023 | **Route Monetization Toggle** — Marcar ruta como free/premium con precio | ⚠️ Parcial en create wizard, falta flujo completo |
| RF-024 | **Premium Route Preview** — Vista previa de rutas premium antes de comprar | ❌ No implementado |

### Prioridad P1

| Req. ID | Feature | Estado |
|---------|---------|--------|
| RF-007 | **Order History** — Paginación y filtros | ⚠️ Lista básica existe, falta paginación |
| RF-014 | **Cash Payment Option** — Pagar en punto de recogida | ❌ No hay opción de método de pago en checkout |
| RF-015 | **Activity Tracking (GPS recording)** | ⚠️ APIs existen, falta integrar con GPS real durante navegación |
| RF-022 | **Creator Dashboard** — Estadísticas de ventas y earnings | ⚠️ Wallet API tiene `fetchWalletSummary` con stats mensuales, falta screen dedicada |
| RF-025 | **Purchase Refunds** | ⚠️ Tipo `reembolsado` existe en payments, falta flujo de UI para solicitar reembolso |

### Prioridad P2

| Req. ID | Feature | Estado |
|---------|---------|--------|
| RF-008 | **Route Sharing** — Compartir vía deeplink | ❌ No implementado |
| RF-018 | **Performance Comparison** — Comparar vs recorridos anteriores | ❌ No implementado |
| RF-019 | **Personal Records** — Récords personales del ciclista | ❌ No implementado |

### Business Module (Web Dashboard) — RF-101 a RF-108

> El **dashboard web para comercios** es un proyecto separado. Todos los RF-1xx están pendientes desde el lado web.

---

## ⚠️ Notas de Implementación

### Wallet
- Los retiros usan un workaround: crean una notificación en vez de un registro en tabla `withdrawals` (la tabla no existe aún).
- El resumen mensual tiene `monthWithdrawals: 0` hardcodeado (TODO en código).
- No hay integración con Stripe Connect para pagos reales a creadores.

### Notifications
- El push token se guarda en el campo `push_token` del perfil con fallback a AsyncStorage si la columna no existe.
- La Edge Function `send-push-notification` existe pero no se verificó si envía push reales.

### Offline
- El caching de tiles tiene callbacks de progreso sin uso (`percentage === 100` no actualiza UI).
- No hay screen dedicada para gestionar descargas offline (ver/eliminar).

---

## 📋 Resumen de Trabajo Pendiente (Ordenado por Prioridad)

1. 🟡 **Integrar Stripe PaymentSheet** en flujo de compra de rutas (RF-020)
2. 🟡 **Premium route preview** antes de comprar (RF-024)
3. 🟡 **Verificar tracking GPS** durante navegación (RF-010)
4. 🟡 **Activity tracking GPS real** (RF-015)
5. 🟢 **Creator dashboard screen** (RF-022) — API ya existe
6. 🟢 **Cash payment option** en checkout (RF-014)
7. 🟢 **Route sharing deeplinks** (RF-008)
8. 🟢 **Offline management screen** — UI para gestionar descargas
9. 🟢 **Stripe Connect** para pagos reales a creadores
10. 🟢 **Performance comparison / personal records** (RF-018, RF-019)

---

## 📚 Documentos Relacionados

- [01 - Project Overview](./01-project-overview.md)
- [02 - Requirements](./02-requirements.md)
- [03 - Architecture](./03-architecture.md)
- [CHANGELOG](./CHANGELOG.md)
