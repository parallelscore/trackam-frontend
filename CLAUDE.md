# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development**
```bash
npm run dev          # Start development server with HMR on all interfaces
npm run build        # Production build with Vite
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run Vitest tests once
npm run test:watch   # Run Vitest in watch mode
```

## Architecture Overview

**TrackAm** is a React 19 + TypeScript delivery tracking application built with Vite. The app serves three user roles: vendors (create deliveries), riders (fulfill deliveries), and customers (track packages).

### Tech Stack
- **Frontend**: React 19 with TypeScript, Vite build system
- **Styling**: Tailwind CSS with shadcn/ui components and Radix UI primitives
- **Routing**: React Router DOM 7.5.1 with lazy-loaded pages
- **State**: React Context API with domain-specific providers (Auth, Delivery, Rider, WebSocket)
- **Real-time**: Socket.IO client for live tracking and notifications  
- **Maps**: Leaflet with React-Leaflet for location visualization
- **Forms**: React Hook Form with validation
- **HTTP**: Axios with interceptors for token management
- **Testing**: Vitest with React Testing Library

### Key Architectural Patterns

**Context-Driven State Management**
The app uses multiple React Context providers that must be properly nested:
- `AuthProvider` - User authentication and sessions (outermost)
- `DeliveryProvider` - Delivery tracking and status
- `WebSocketProvider` - Real-time communication  
- `RiderProvider` - Rider location and permissions (innermost)

**Service Layer Architecture**
- Separate service files per domain (`authService.ts`, `deliveryService.ts`, `riderService.ts`, `websocketService.ts`)
- Mock service toggle via `USE_MOCK_SERVICE` flag in `src/config/serviceConfig.ts`
- `ApiClient` class with automatic JWT token refresh, retry logic, and comprehensive error handling
- Both authenticated (`apiClient`) and public (`publicApiClient`) client instances available

**Lazy Loading & Performance**
- All route components lazy-loaded with `React.lazy()` in `App.tsx`
- Suspense boundaries with `LoadingFallback` component
- Framer Motion page transitions optimized for mobile
- Path aliases (`@/`) configured in Vite for clean imports

**Mobile-First Responsive Design**
- Touch-friendly components in `src/components/ui/mobile-utils.tsx`
- Conditional rendering based on mobile detection
- Nigerian-themed color palette: Green primary (#0CAA41), Dark blue secondary (#1A2C56), Orange accent (#FF9500)
- CSS fixes for iOS Safari viewport issues

### Directory Structure

```
src/
├── components/
│   ├── common/     # Layout, Navbar, Footer, TrackingForm
│   ├── customer/   # Customer-specific tracking components
│   ├── map/        # Location and map components
│   ├── rider/      # Rider-specific components  
│   ├── ui/         # shadcn/ui reusable components + mobile-utils
│   └── vendor/     # Vendor dashboard components
├── context/        # React Context providers (Auth, Delivery, Rider, WebSocket)
├── hooks/          # Custom React hooks (useGeolocation, useWebSocket)
├── pages/          # Route-level components (lazy loaded)
├── services/       # API service layers with mock/real toggle
├── types/          # TypeScript definitions
├── utils/          # Utility functions
└── config/         # Configuration files
```

### Critical Implementation Details

**Multi-Role Application Flow**
The app handles three distinct user flows with shared components:
- **Vendors**: Create deliveries, assign riders, track status
- **Riders**: Accept deliveries, update location, complete deliveries  
- **Customers**: Track packages, confirm delivery

Always check user role in contexts before rendering role-specific UI.

**Real-time WebSocket Integration** 
Socket.IO provides live location updates and delivery notifications. The `WebSocketContext` handles connection states and reconnection logic. Key events:
- `location_update` - Rider position changes
- `delivery_status_change` - Status updates
- `delivery_created` - New delivery notifications

**Location Services & Permissions**
Critical for rider functionality. The app includes:
- Device-specific geolocation optimizations in `riderUtils.ts`
- Permission checking with device-aware timeouts (iOS: 20s, others: 15s)
- Graceful degradation when location is unavailable
- `PermissionSynchronizer` component in `App.tsx` manages location permissions

**API Client Architecture**
The `ApiClient` class provides:
- Automatic JWT token attachment and refresh
- Retry logic with exponential backoff
- Request/response logging in development
- Standardized error handling with `ApiResponse<T>` wrapper
- Token expiration handling with automatic logout

**Environment Configuration**
Key environment variables:
- `VITE_API_URL` - Backend API endpoint
- `VITE_PUBLIC_URL` - Public URL for the app
- `USE_MOCK_SERVICE` - Toggle in serviceConfig.ts for mock vs real API

**Mobile Responsiveness**
- Mobile detection hook: `useMobileDetection()`
- Touch-friendly components with 44px+ touch targets
- Conditional rendering for mobile vs desktop experiences
- Safe area handling for devices with notches

### Testing Strategy

Tests use Vitest with jsdom environment. Component tests should use React Testing Library patterns. Test files follow `*.test.ts` or `*.spec.ts` naming convention.

### Authentication Flow

1. Phone-based authentication with OTP verification
2. JWT tokens stored in localStorage  
3. Automatic token refresh via API interceptors
4. Custom event `auth:token-expired` for logout handling
5. Protected routes check authentication in `AuthContext`

### Styling Conventions

- Nigerian-inspired color palette defined in `tailwind.config.js`
- Components use `class-variance-authority` for variants
- `tailwind-merge` for conditional classes and conflict resolution
- Framer Motion for page transitions and micro-interactions
- CSS custom properties for theme consistency