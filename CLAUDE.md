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

**Trackam** is a React 19 + TypeScript delivery tracking application built with Vite. The app serves three user roles: vendors (create deliveries), riders (fulfill deliveries), and customers (track packages).

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
The app uses multiple React Context providers:
- `AuthContext` - User authentication and sessions
- `DeliveryContext` - Delivery tracking and status
- `RiderContext` - Rider location and permissions  
- `WebSocketContext` - Real-time communication

**Service Layer Architecture**
- Separate service files per domain (`auth.ts`, `delivery.ts`, `rider.ts`, `websocket.ts`)
- Mock service toggle via `USE_MOCK_SERVICE` environment flag
- Axios interceptors handle JWT token refresh automatically

**Lazy Loading & Performance**
- All route components lazy-loaded with `React.lazy()`
- Suspense boundaries with `LoadingFallback` component
- Framer Motion page transitions optimized for mobile
- Path aliases (`@/`) for clean imports

### Directory Structure

```
src/
├── components/
│   ├── common/     # Layout, Navbar, Footer
│   ├── customer/   # Customer-specific components
│   ├── map/        # Location and map components
│   ├── rider/      # Rider-specific components  
│   ├── ui/         # shadcn/ui reusable components
│   └── vendor/     # Vendor-specific components
├── context/        # React Context providers
├── hooks/          # Custom React hooks
├── pages/          # Route-level components (lazy loaded)
├── services/       # API service layers
├── types/          # TypeScript definitions
├── utils/          # Utility functions
└── config/         # Configuration files
```

### Development Notes

**Multi-Role Application**
The app handles three distinct user flows with shared components. Check user role in contexts before rendering role-specific UI.

**Real-time Features** 
WebSocket integration provides live location updates and delivery notifications. Handle connection states and reconnection logic properly.

**Mobile-First Design**
The app targets mobile users heavily. Pay attention to iOS Safari viewport issues and touch interactions. Custom CSS fixes are in place for mobile responsiveness.

**Location Services**
Geolocation permission handling is critical for rider functionality. The app includes device-specific optimizations and graceful degradation.

**Environment Configuration**
- `VITE_API_URL` - Backend API endpoint
- `VITE_PUBLIC_URL` - Public URL for the app
- `USE_MOCK_SERVICE` - Toggle mock vs real API calls

### Testing Strategy

Tests use Vitest with jsdom environment. Component tests should use React Testing Library patterns. Test files follow `*.test.ts` or `*.spec.ts` naming.

### Styling Conventions

The app uses a Nigerian-inspired color palette (Green primary, Dark blue secondary, Orange accent) with Tailwind CSS utility classes. Components use `class-variance-authority` for variants and `tailwind-merge` for conditional classes.