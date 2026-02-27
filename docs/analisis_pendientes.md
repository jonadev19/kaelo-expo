# 📊 Estado del Proyecto Kaelo Expo — Qué Falta por Implementar

**Fecha:** 2026-02-27  
**Versión del análisis:** 1.0

---

## 🚨 Problema Crítico: Conflictos de Merge Sin Resolver

Hay **conflictos de git merge** (`<<<<<<< HEAD`) en archivos críticos que **impiden compilar** la app:

| Archivo | Conflictos |
|---------|-----------|
| `app/_layout.tsx` | 6 conflictos (navegación, auth guards, rutas) |
| `src/lib/supabase.ts` | Config de Supabase |
| `src/features/routes/screens/Explore.tsx` | 4 conflictos |
| `src/features/routes/screens/Routes.tsx` | Pantalla completa |
| `src/features/profile/screens/ProfileHomeScreen.tsx` | 17+ conflictos |
| `src/features/profile/screens/AppSettingsScreen.tsx` | 3 conflictos |
| `src/features/routes/api.ts` | API de rutas |
| `src/features/routes/keys.ts` | Query keys |
| `src/features/routes/hooks/useRoutes.ts` | Hooks de rutas |

> ⚠️ **Estos conflictos deben resolverse ANTES de cualquier otro trabajo.** La app no compila con merge conflicts.

---

## ✅ Lo que YA está implementado

| Módulo | Estado | Detalle |
|--------|--------|---------|
| **Auth** (login/register) | ✅ Funcional | Supabase Auth con auth guards, login, registro |
| **Rutas** (discovery, detail, search) | ✅ APIs listas | `fetchPublishedRoutes`, `fetchRouteDetail`, `searchRoutes` con RPCs de Supabase |
| **Crear Rutas** (5-step wizard) | ✅ Screens creadas | Draw → Waypoints → Details → Businesses → Review |
| **Negocios** (list, detail, search) | ✅ APIs listas | `fetchBusinesses`, `searchBusinesses`, `fetchBusinessDetail` |
| **Órdenes** (crear, listar, cancelar) | ✅ APIs listas | `createOrder`, `fetchMyOrders`, `cancelOrder` |
| **Carrito** | ✅ Screen creada | `CartScreen` con store |
| **Favoritos** (guardar rutas) | ✅ CRUD completo | `fetchSavedRoutes`, `toggleSaveRoute`, `checkRouteSaved` |
| **Reviews** (rutas y negocios) | ✅ CRUD completo | `fetchRouteReviews`, `submitReview`, `fetchBusinessReviews`, `deleteReview` |
| **Métricas personales** | ✅ APIs listas | Dashboard, achievements, activity history |
| **Perfil** (view, edit, stats) | ✅ APIs listas | `fetchProfile`, `updateProfile`, `fetchProfileStats` |
| **Navegación GPS** | ✅ Screen creada | `NavigationScreen` (modal fullscreen) |
| **Tema dark/light** | ✅ Funcional | `useTheme` hook |
| **React Query** | ✅ Configurado | `QueryClientProvider` en root layout |
| **DB Migrations** (19 archivos) | ✅ Creadas | En `migrations/reference/` |

---

## ❌ Lo que FALTA por implementar

### Prioridad P0 (Crítico para MVP)

| Req. ID | Feature | Estado |
|---------|---------|--------|
| RF-004 | **Offline Route Download** — Descargar mapas/rutas para uso sin internet | ❌ No existe código de offline/caching |
| RF-006 | **Payment Processing** — Integración con pasarela de pagos (Stripe) | ❌ Solo existe en DB types, no hay lógica de pago |
| RF-009 | **Push Notifications** — Notificaciones de estado de órdenes | ❌ No hay código de push notifications |
| RF-010 | **Location Tracking (real-time)** — Seguimiento GPS durante navegación | ⚠️ Screen existe pero falta verificar si tracking real funciona |
| RF-020 | **Route Purchase** — Comprar rutas premium | ❌ UI de "premium" existe en cards/details pero no hay flujo de compra |
| RF-021 | **Wallet Management** — Balance, historial, retiros para creators | ❌ Solo referencia en `ProfileHomeScreen` y DB types |
| RF-023 | **Route Monetization Toggle** — Marcar ruta como free/premium con precio | ⚠️ Parcial en create wizard, falta flujo completo |
| RF-024 | **Premium Route Preview** — Vista previa de rutas premium antes de comprar | ❌ No implementado |

### Prioridad P1

| Req. ID | Feature | Estado |
|---------|---------|--------|
| RF-007 | **Order History** — Paginación y filtros | ⚠️ Lista básica existe, falta paginación |
| RF-014 | **Cash Payment Option** — Pagar en punto de recogida | ❌ No hay opción de método de pago en checkout |
| RF-015 | **Activity Tracking (GPS recording)** | ⚠️ APIs existen, falta integrar con GPS real durante navegación |
| RF-022 | **Creator Dashboard** — Estadísticas de ventas y earnings | ❌ No existe módulo de creator |
| RF-025 | **Purchase Refunds** | ❌ No existe |

### Prioridad P2

| Req. ID | Feature | Estado |
|---------|---------|--------|
| RF-008 | **Route Sharing** — Compartir vía deeplink | ❌ No implementado |
| RF-018 | **Performance Comparison** — Comparar vs recorridos anteriores | ❌ No implementado |
| RF-019 | **Personal Records** — Récords personales del ciclista | ❌ No implementado |

### Business Module (Web Dashboard) — RF-101 a RF-108

> El **dashboard web para comercios** es un proyecto separado. Todos los RF-1xx están pendientes desde el lado web.

---

## 📋 Resumen de Trabajo Pendiente (Ordenado por Prioridad)

1. 🔴 **Resolver merge conflicts** (bloquea todo lo demás)
2. 🔴 **Verificar que la app compila y corre** después de resolver conflictos
3. 🟡 **Integrar pagos con Stripe** (RF-006, RF-020, RF-021)
4. 🟡 **Push notifications** con Expo (RF-009)
5. 🟡 **Offline route download** (RF-004)
6. 🟡 **Activity tracking GPS real** (RF-015)
7. 🟢 **Route sharing deeplinks** (RF-008)
8. 🟢 **Creator dashboard** (RF-022)
9. 🟢 **Premium preview / monetization** (RF-023, RF-024)
10. 🟢 **Performance comparison / personal records** (RF-018, RF-019)

---

## 📚 Documentos Relacionados

- [01 - Project Overview](./01-project-overview.md)
- [02 - Requirements](./02-requirements.md)
- [03 - Architecture](./03-architecture.md)
- [CHANGELOG](./CHANGELOG.md)
