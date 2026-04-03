# Proposal: Phase 3 — Productos + Imágenes Module

## Intent

Implement the **Productos CRUD** and **Imágenes Upload/Gallery** modules for GanaTrack frontend, completing Phase 3 of the frontend roadmap (Weeks 5–6). This delivers inventory management for veterinary products (medications, supplements, supplies) and a reusable image management system with drag-and-drop upload, preview, gallery, and entity association capabilities.

## Scope

### In Scope
- **Productos Module**: Full CRUD with list, create, edit, delete, detail views
  - Table with filters (tipo, estado, search), pagination, stock-low indicators
  - Form with React Hook Form + Zod validation
  - Product detail with image gallery integration
  - Association to sanitary events (treatments)
- **Imágenes Module**: Reusable image management system
  - Drag-and-drop upload component (react-dropzone)
  - Preview before upload with size/format validation
  - Gallery grid with lightbox (thumbnail → full view)
  - Image deletion with confirmation
  - Entity association system (animal, producto)
  - Offline caching via Service Worker (CacheFirst 7d)
- **Shared Components**: ImageUploader, ImageGallery, Lightbox, DropzoneArea
- **State Management**: Zustand store for upload queue, image cache
- **API Integration**: TanStack Query hooks for all endpoints
- **Navigation**: Sidebar integration, route configuration

### Out of Scope
- **Backend API implementation** — endpoints assumed available or mocked via MSW
- **Image compression/optimization** — handled by backend (RF-IMAGEN-03.2)
- **Thumbnail generation** — backend responsibility (RF-IMAGEN-03.3)
- **Advanced image editing** — cropping, filters, annotations
- **Video upload support** — future enhancement
- **Bulk image operations** — beyond delete individual
- **Image tagging/metadata** — future enhancement

## Capabilities

### New Capabilities
- `productos`: CRUD operations for veterinary products (medications, supplements, supplies) with inventory tracking, filtering, and stock management
- `imagenes`: Reusable image management system with upload, gallery, lightbox, and entity association capabilities

### Modified Capabilities
- None — these are new modules that integrate with existing infrastructure

## Approach

### 1. **Productos Module** (Primary deliverable)
Follow established patterns from `animales` module:
- **Types**: `producto.types.ts` with Producto, ProductoFilters, PaginatedProductos interfaces
- **Services**: `producto.api.ts` (RealProductoService), `producto.mock.ts` (MockProductoService), `producto.service.ts` (interface)
- **Hooks**: `useProductos.ts`, `useProducto.ts`, `useCreateProducto.ts`, `useUpdateProducto.ts`, `useDeleteProducto.ts`
- **Components**: `ProductoTable.tsx`, `ProductoForm.tsx`, `ProductoDetail.tsx`
- **Routes**: `/dashboard/productos`, `/dashboard/productos/nuevo`, `/dashboard/productos/[id]`

### 2. **Imágenes Module** (Secondary deliverable)
Create as shared module since it serves multiple entities:
- **Types**: `imagen.types.ts` with Imagen, UploadParams, GalleryConfig interfaces
- **Services**: `imagen.api.ts` (RealImagenService), `imagen.mock.ts` (MockImagenService)
- **Hooks**: `useImagenes.ts`, `useUploadImagen.ts`, `useDeleteImagen.ts`
- **Components**: `ImageUploader.tsx`, `ImageGallery.tsx`, `Lightbox.tsx`, `DropzoneArea.tsx`
- **Shared Integration**: Export from `shared/components/imagenes/` for reuse across modules

### 3. **Technical Decisions**
- **Upload**: react-dropzone (already in PRD) with FormData multipart upload
- **Preview**: FileReader API for client-side preview before upload
- **Gallery**: CSS Grid with aspect-ratio containers, lightbox via Radix Dialog
- **State**: Zustand store for upload queue (multiple files, progress tracking)
- **Caching**: Service Worker CacheFirst for images (7d TTL)
- **Validation**: Zod schemas for file type (JPEG/PNG/WebP), size (5MB limit)
- **Offline**: Placeholder blur + offline indicator per RF-IMAGEN-04

### 4. **Integration Points**
- **Productos ↔ Imágenes**: Product detail includes image gallery, product form includes main image upload
- **Animales ↔ Imágenes**: Animal detail can display/manage images (future integration)
- **Shared Hooks**: `useDebounce` for search, `useOnlineStatus` for offline indicators
- **Navigation**: Sidebar already has "Productos" entry (line 307 in navigation.config.ts)

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/web/src/modules/productos/` | New | Complete module with types, services, hooks, components |
| `apps/web/src/modules/imagenes/` | New | Reusable image management module |
| `apps/web/src/shared/components/imagenes/` | New | Shared image components for cross-module use |
| `apps/web/src/shared/lib/query-keys.ts` | Modified | Add productos and imagenes query key factories |
| `apps/web/src/shared/lib/navigation.config.ts` | Already exists | Sidebar entry for Productos (line 307) |
| `apps/web/src/app/dashboard/productos/` | New | Route pages for product views |
| `apps/web/src/store/` | Modified | Add `imagen.store.ts` for upload queue state |
| `apps/web/src/shared/hooks/` | Existing | Use existing useDebounce, useOnlineStatus |
| `packages/shared-types/` | Modified | Add Producto, Imagen Zod schemas if not exist |
| `apps/web/src/shared/components/ui/` | Existing | Use existing DataTable, Modal, FormField, Button |
| `apps/web/public/locales/es.json` | Modified | Add i18n strings for productos and imagenes modules |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Large file uploads blocking UI | Medium | Implement chunked upload or show progress with cancellation option |
| CORS issues with image upload | Low | Ensure backend CORS configured for multipart/form-data |
| Image optimization performance | Low | Backend handles compression; frontend shows preview only |
| Memory leaks from FileReader | Medium | Revoke object URLs after upload completes or cancel |
| Offline sync conflicts | Medium | Use Service Worker cache strategy, queue uploads when offline |
| react-dropzone compatibility with Next.js 16 | Low | Verify template includes compatible version |
| Large gallery rendering performance | Medium | Implement virtual scrolling or pagination for galleries > 20 images |

## Rollback Plan

1. **Feature Flag**: Wrap new routes in feature flag (e.g., `NEXT_PUBLIC_ENABLE_PRODUCTOS`)
2. **Gradual Rollout**: Deploy with routes disabled, enable per environment
3. **Database Rollback**: Productos table is additive — no migrations affect existing tables
4. **Image Cleanup**: If upload system fails, images stored in backend can be cleaned via admin script
5. **Navigation**: Remove sidebar entry by commenting out line 307 in navigation.config.ts
6. **Dependencies**: No breaking changes to existing modules — new code is isolated

## Dependencies

- **Backend Endpoints**: All 9 endpoints from PRD must be available (or mocked via MSW)
  - `GET /api/v1/productos` with filters
  - `GET /api/v1/productos/:id`
  - `POST /api/v1/productos`
  - `PUT /api/v1/productos/:id`
  - `DELETE /api/v1/productos/:id`
  - `POST /api/v1/imagenes/upload`
  - `GET /api/v1/imagenes/:id`
  - `DELETE /api/v1/imagenes/:id`
  - `GET /api/v1/imagenes?entidad=&entidad_id=`
- **react-dropzone**: Must be installed (listed in PRD as template dependency)
- **Shared Components**: DataTable, Modal, FormField, Button from `shared/components/ui/`
- **Existing Hooks**: useDebounce, useOnlineStatus from `shared/hooks/`
- **Query Infrastructure**: query-keys.ts, query-client.ts patterns established

## Success Criteria

- [ ] **Productos CRUD Complete**: Can list, create, edit, delete products via UI
- [ ] **Filters Working**: Search by name, filter by tipo, estado, with pagination
- [ ] **Stock Indicators**: Low stock products highlighted in red per RF-PROD-01.4
- [ ] **Image Upload**: Drag-and-drop upload with preview, size validation (5MB), format validation (JPEG/PNG/WebP)
- [ ] **Image Gallery**: Grid display with thumbnails, lightbox on click
- [ ] **Image Management**: Delete individual images with confirmation
- [ ] **Entity Association**: Images correctly associated to products (and animals in future)
- [ ] **Offline Support**: Images cached via Service Worker, offline indicators displayed
- [ ] **Performance**: Gallery loads < 2s for 20 images, upload progress visible
- [ ] **Accessibility**: Keyboard navigation for gallery, screen reader support for images
- [ ] **i18n**: All strings externalized to es.json/en.json
- [ ] **Testing**: Unit tests for hooks/services, component tests for gallery/upload
- [ ] **Code Quality**: Follows established patterns from animales module, passes linting

## Next Steps

After proposal approval:
1. **Spec Phase**: Create detailed specs for productos CRUD and imagenes upload/gallery
2. **Design Phase**: Technical design for image upload architecture, gallery component hierarchy
3. **Task Breakdown**: Implementation tasks with time estimates
4. **Implementation**: Follow SDD apply phase with existing patterns
