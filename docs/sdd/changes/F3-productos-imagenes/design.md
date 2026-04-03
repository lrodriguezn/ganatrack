# Design: Phase 3 — Productos + Imágenes Module

## Technical Approach

Two tightly coupled modules following established GanaTrack patterns: **productos** (full CRUD, `modules/productos/`) and **imagenes** (reusable image system, `modules/imagenes/`). Image components live in `modules/imagenes/` and are imported cross-module — NOT in `shared/` — because they have domain logic (entity association, upload queue) that violates shared's pure-UI contract. The product detail page integrates the gallery inline via direct import, not a layout slot.

Stack additions: `react-dropzone` (drag-and-drop), `@radix-ui/react-dialog` (already installed, reused for lightbox). No new Radix packages needed.

---

## Architecture Decisions

### Decision: Image Module Location — `modules/imagenes/` vs `shared/components/imagenes/`

**Choice**: `modules/imagenes/` with export barrel
**Alternatives considered**: `shared/components/imagenes/` (PRD original placement)
**Rationale**: Image components need domain hooks (`useImagenes`, `useUploadImagen`), types (`Imagen`, `UploadParams`), and services (`imagenService`). Putting them in `shared/` would either require duplicating logic or importing from `modules/`, violating dependency rules (`shared` must NOT import from `modules`). Cross-module consumption via `import { ImageGallery } from '@/modules/imagenes'` is clean and explicit.

### Decision: Upload Queue — Zustand Store vs Component State

**Choice**: Zustand store (`imagen.store.ts`) for upload queue
**Alternatives considered**: Component-local `useReducer`, TanStack Query mutations
**Rationale**: Upload queue is shared UI state — the dropzone component adds files, progress displays in a toast/panel, and cancellation can happen from anywhere. Component state would be lifted awkwardly. TanStack Query mutations don't track per-file progress. Zustand gives a single source of truth for `UploadQueueItem[]` with `status`, `progress`, `error` per file.

### Decision: Gallery Placement — Inline vs Separate Page

**Choice**: Inline in product detail page (`/dashboard/productos/[id]`)
**Alternatives considered**: Separate `/dashboard/productos/[id]/imagenes` page
**Rationale**: Productos are inventory items, not media-first entities. Users expect to see product images alongside product data, not navigate to a separate page. Inline gallery with a "Ver todas" link to a dedicated gallery page if images exceed 20. This matches the existing `animal-detail-tabs` pattern.

### Decision: Preview Strategy — Before Upload (Client-Side)

**Choice**: `FileReader.readAsDataURL()` for preview BEFORE upload
**Alternatives considered**: Server-generated thumbnails after upload
**Rationale**: Immediate visual feedback is critical for UX — user drops 5 files, sees all previews instantly, removes bad ones before wasting bandwidth. Server thumbnails are generated AFTER upload (backend responsibility per RF-IMAGEN-03.3) and shown on subsequent loads. Both strategies coexist: client preview during upload flow, server thumbnails in gallery display.

### Decision: Entity Association — Generic `entidadTipo` + `entidadId`

**Choice**: Polymorphic association via string `entidadTipo` ('producto' | 'animal') + numeric `entidadId`
**Alternatives considered**: Separate FK columns (`productoId`, `animalId`), join tables
**Rationale**: Backend already uses this pattern (per API contract). The frontend mirrors it: `useImagenes({ entidadTipo: 'producto', entidadId: 123 })`. This scales to future entities without schema changes. Query keys reflect this: `['imagenes', 'producto', 123]`.

### Decision: Lightbox — Radix Dialog vs Custom Modal

**Choice**: Reuse existing `shared/components/ui/modal.tsx` (Radix Dialog wrapper)
**Alternatives considered**: `react-image-lightbox` library, custom overlay
**Rationale**: Modal component already exists with Radix Dialog, animations, accessibility. Building a lightbox variant on top of it avoids new dependencies and maintains design consistency. The lightbox adds navigation arrows, keyboard left/right, and image counter — extending, not replacing, the modal.

---

## Data Flow

### Upload Flow (Multiple Files)

```
User drops files → DropzoneArea validates (type/size)
       │
       ▼
  imagenStore.addFiles(files[]) → creates UploadQueueItem[]
       │
       ▼
  useUploadImagen hook watches queue, calls imagenService.upload()
       │
       ├─ FormData multipart POST /api/v1/imagenes/upload
       ├─ onProgress callback → imagenStore.updateProgress(fileId, pct)
       └─ onSuccess → imagenStore.markComplete(fileId)
                        → queryClient.invalidateQueries(imagenes key)
       │
       ▼
  ImageGallery re-renders with new images from cache
```

### Gallery Load Flow

```
ProductDetail page mounts
       │
       ▼
  useImagenes({ entidadTipo: 'producto', entidadId })
       │
       ▼
  TanStack Query → imagenService.listByEntity()
       │
       ▼
  GET /api/v1/imagenes?entidad_tipo=producto&entidad_id=123
       │
       ▼
  ImageGallery renders CSS Grid of <ImageThumbnail> components
       │
       ▼
  User clicks thumbnail → Lightbox opens with full-res image
```

### Invalidation Strategy

```
Upload success  → invalidate imagenes.byEntity(tipo, id)
Delete image    → invalidate imagenes.byEntity(tipo, id) + removeQuery(imagenes.detail(id))
Delete product  → invalidate productos.all + imagenes.byEntity('producto', id)
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/web/src/modules/productos/types/producto.types.ts` | Create | Producto, ProductoFilters, PaginatedProductos, CreateProductoDto, UpdateProductoDto |
| `apps/web/src/modules/productos/services/producto.service.ts` | Create | ProductoService interface + factory (mock/real) |
| `apps/web/src/modules/productos/services/producto.api.ts` | Create | RealProductoService — ky calls to /productos |
| `apps/web/src/modules/productos/services/producto.mock.ts` | Create | MockProductoService — MSW-compatible mock data |
| `apps/web/src/modules/productos/services/index.ts` | Create | Barrel export |
| `apps/web/src/modules/productos/hooks/use-productos.ts` | Create | useQuery for paginated list |
| `apps/web/src/modules/productos/hooks/use-producto.ts` | Create | useQuery for single product |
| `apps/web/src/modules/productos/hooks/use-create-producto.ts` | Create | useMutation create |
| `apps/web/src/modules/productos/hooks/use-update-producto.ts` | Create | useMutation update |
| `apps/web/src/modules/productos/hooks/use-delete-producto.ts` | Create | useMutation delete |
| `apps/web/src/modules/productos/hooks/index.ts` | Create | Barrel export |
| `apps/web/src/modules/productos/components/producto-table.tsx` | Create | DataTable wrapper with filters |
| `apps/web/src/modules/productos/components/producto-form.tsx` | Create | RHF + Zod form for create/edit |
| `apps/web/src/modules/productos/components/producto-detail.tsx` | Create | Detail view with inline ImageGallery |
| `apps/web/src/modules/productos/components/producto-filters.tsx` | Create | Filter panel (tipo, estado, search) |
| `apps/web/src/modules/productos/index.ts` | Create | Module barrel export |
| `apps/web/src/modules/imagenes/types/imagen.types.ts` | Create | Imagen, UploadParams, UploadQueueItem, GalleryConfig |
| `apps/web/src/modules/imagenes/services/imagen.service.ts` | Create | ImagenService interface + factory |
| `apps/web/src/modules/imagenes/services/imagen.api.ts` | Create | RealImagenService — upload, list, delete |
| `apps/web/src/modules/imagenes/services/imagen.mock.ts` | Create | MockImagenService |
| `apps/web/src/modules/imagenes/services/index.ts` | Create | Barrel export |
| `apps/web/src/modules/imagenes/hooks/use-imagenes.ts` | Create | useQuery list by entity |
| `apps/web/src/modules/imagenes/hooks/use-upload-imagen.ts` | Create | Mutation with progress tracking |
| `apps/web/src/modules/imagenes/hooks/use-delete-imagen.ts` | Create | Mutation with cache invalidation |
| `apps/web/src/modules/imagenes/hooks/index.ts` | Create | Barrel export |
| `apps/web/src/modules/imagenes/components/dropzone-area.tsx` | Create | react-dropzone wrapper with validation |
| `apps/web/src/modules/imagenes/components/image-uploader.tsx` | Create | Dropzone + preview grid + progress |
| `apps/web/src/modules/imagenes/components/image-gallery.tsx` | Create | CSS Grid gallery with thumbnails |
| `apps/web/src/modules/imagenes/components/image-thumbnail.tsx` | Create | Single thumbnail with lazy load |
| `apps/web/src/modules/imagenes/components/lightbox.tsx` | Create | Radix Dialog-based full image viewer |
| `apps/web/src/modules/imagenes/components/upload-progress.tsx` | Create | Per-file progress bar overlay |
| `apps/web/src/modules/imagenes/index.ts` | Create | Module barrel export |
| `apps/web/src/store/imagen.store.ts` | Create | Zustand store for upload queue |
| `apps/web/src/app/(dashboard)/productos/page.tsx` | Create | Product list page |
| `apps/web/src/app/(dashboard)/productos/nuevo/page.tsx` | Create | Create product page |
| `apps/web/src/app/(dashboard)/productos/[id]/page.tsx` | Create | Product detail page |
| `apps/web/src/app/(dashboard)/productos/[id]/editar/page.tsx` | Create | Edit product page |
| `apps/web/src/app/(dashboard)/productos/loading.tsx` | Create | Skeleton loader |
| `apps/web/src/app/(dashboard)/productos/error.tsx` | Create | Error boundary |
| `apps/web/src/shared/lib/query-keys.ts` | Modify | Add `productos` and `imagenes` key factories |
| `apps/web/package.json` | Modify | Add `react-dropzone` dependency |
| `apps/web/tests/mocks/handproductos.handlers.ts` | Create | MSW handlers for productos |
| `apps/web/tests/mocks/handlers/imagenes.handlers.ts` | Create | MSW handlers for imagenes |

---

## Interfaces / Contracts

### Producto Types

```typescript
// modules/productos/types/producto.types.ts
export interface Producto {
  id: number;
  predioId: number;
  nombre: string;
  descripcion?: string;
  tipoKey: number;           // 1=Medicamento, 2=Suplemento, 3=Insumo
  unidadMedida: string;      // 'ml', 'kg', 'dosis', 'unidad'
  precioUnitario?: number;
  stockActual: number;
  stockMinimo?: number;
  estadoKey: number;         // 1=Activo, 2=Inactivo
  fechaVencimiento?: string; // ISO date
  proveedorId?: number;
  createdAt: string;
  updatedAt: string;
  // Joined
  tipoNombre?: string;
  proveedorNombre?: string;
}

export interface ProductoFilters {
  predioId: number;
  page: number;
  limit: number;
  search?: string;
  tipoKey?: number;
  estadoKey?: number;
}

export interface PaginatedProductos {
  data: Producto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type CreateProductoDto = Omit<Producto, 'id' | 'createdAt' | 'updatedAt' | 'tipoNombre' | 'proveedorNombre'>;
export type UpdateProductoDto = Partial<CreateProductoDto>;
```

### Imagen Types

```typescript
// modules/imagenes/types/imagen.types.ts
export type EntidadTipo = 'producto' | 'animal';

export interface Imagen {
  id: number;
  url: string;
  thumbnailUrl: string;
  entidadTipo: EntidadTipo;
  entidadId: number;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ImagenFilters {
  entidadTipo: EntidadTipo;
  entidadId: number;
}

// Upload queue state (Zustand)
export type UploadStatus = 'pending' | 'uploading' | 'complete' | 'error';

export interface UploadQueueItem {
  id: string;                    // crypto.randomUUID()
  file: File;
  preview: string;               // dataURL from FileReader
  status: UploadStatus;
  progress: number;              // 0-100
  error?: string;
}

// Gallery config
export interface GalleryConfig {
  columns?: number;              // default 3 (mobile: 2)
  maxPreviewSize?: number;       // px, default 5MB
  allowedTypes?: string[];       // default ['image/jpeg','image/png','image/webp']
}
```

### Service Interfaces

```typescript
// modules/productos/services/producto.service.ts
export interface ProductoService {
  getAll(filters: ProductoFilters): Promise<PaginatedProductos>;
  getById(id: number): Promise<Producto>;
  create(data: CreateProductoDto): Promise<Producto>;
  update(id: number, data: UpdateProductoDto): Promise<Producto>;
  delete(id: number): Promise<void>;
}

// modules/imagenes/services/imagen.service.ts
export interface ImagenService {
  listByEntity(filters: ImagenFilters): Promise<Imagen[]>;
  getById(id: number): Promise<Imagen>;
  upload(file: File, entidadTipo: EntidadTipo, entidadId: number, onProgress?: (pct: number) => void): Promise<Imagen>;
  delete(id: number): Promise<void>;
}
```

### Imagen Upload — FormData Contract

```typescript
// RealImagenService.upload implementation sketch
async upload(file, entidadTipo, entidadId, onProgress): Promise<Imagen> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entidad_tipo', entidadTipo);
  formData.append('entidad_id', String(entidadId));

  // ky doesn't support upload progress natively — use XMLHttpRequest wrapper
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = () => reject(new ApiError('UPLOAD_FAILED', 'Error al subir imagen', 0));
    xhr.open('POST', `${API_BASE}/api/v1/imagenes/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}
```

**Rationale for XMLHttpRequest**: ky (fetch-based) does NOT support upload progress events. XHR's `upload.onprogress` is the only reliable way to track multipart upload progress in browsers. This is a known limitation — worth the 20-line wrapper for per-file progress bars.

### Zustand Upload Store

```typescript
// store/imagen.store.ts
interface ImagenStore {
  queue: UploadQueueItem[];
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  markComplete: (id: string) => void;
  markError: (id: string, error: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
}
```

### Query Keys Extension

```typescript
// Add to query-keys.ts
productos: {
  ...createQueryKeys('productos'),
},
imagenes: {
  all: ['imagenes'] as const,
  byEntity: (tipo: string, id: number) => ['imagenes', tipo, id] as const,
  detail: (id: number) => ['imagenes', 'detail', id] as const,
},
```

---

## Component Hierarchy

### Producto Module

```
ProductoTable (TanStack Table wrapper)
├── ProductoFilters (search, tipo, estado selects)
├── DataTable columns: [nombre, tipo, stock, estado, acciones]
└── Actions: edit, delete with confirmation

ProductoForm (RHF + Zod)
├── FormField: nombre (required)
├── FormField: descripcion (textarea)
├── FormField: tipoKey (select)
├── FormField: unidadMedida (select)
├── FormField: precioUnitario (number)
├── FormField: stockActual (number)
├── FormField: stockMinimo (number)
├── FormField: fechaVencimiento (date)
├── FormField: estadoKey (select)
└── Submit/Cancel buttons

ProductoDetail
├── Product metadata (name, type, stock, price)
├── Stock indicator (badge: green/red based on stockMinimo)
├── ImageGallery (inline, from modules/imagenes)
│   ├── ImageThumbnail[] (CSS Grid)
│   └── "Upload more" button → ImageUploader modal
└── Action buttons: Edit, Delete
```

### Imagen Module

```
ImageUploader (orchestrator)
├── DropzoneArea (react-dropzone)
│   └── Drag overlay + click-to-browse
├── UploadPreview (files selected, not yet uploaded)
│   └── PreviewCard[] (FileReader dataURL + remove button)
├── UploadProgress (during upload)
│   └── ProgressBar[] per file
└── Submit button → triggers upload queue

ImageGallery (display)
├── ImageThumbnail[] (CSS Grid, lazy loaded)
│   └── onClick → Lightbox
├── EmptyState (no images)
└── "Add images" button → opens ImageUploader modal

Lightbox (Radix Dialog)
├── Full-res image display
├── Navigation arrows (prev/next)
├── Image counter (3/12)
├── Keyboard support (← → Esc)
└── Delete button (with confirmation)
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| **Types/Zod** | Producto schema validates correctly, rejects invalid stock/date | Unit: vitest + zod parse |
| **Services** | API calls hit correct endpoints, mock returns expected shapes | Unit: MSW handlers + vitest |
| **Hooks** | `useProductos` returns paginated data, `useUploadImagen` tracks progress | Unit: `renderHook` + QueryClient wrapper |
| **Zustand Store** | `addFiles` creates queue items, `updateProgress` mutates correctly | Unit: direct store calls |
| **DropzoneArea** | Accepts valid files (JPEG/PNG/WebP <5MB), rejects invalid | Component: render + fireEvent drop |
| **ImageUploader** | Shows preview after file selection, progress during upload | Component: render + MSW intercept |
| **ImageGallery** | Renders grid of thumbnails, opens lightbox on click | Component: render + userEvent |
| **Lightbox** | Keyboard navigation (←→), escape closes, delete confirms | Component: render + userEvent |
| **ProductoForm** | Validation errors show, submit calls mutation | Component: render + MSW |
| **ProductoTable** | Filters apply, pagination works | Component: render + MSW |
| **E2E** | Full flow: create product → upload images → view gallery → delete | Playwright |

---

## Performance Considerations

| Concern | Strategy |
|---------|----------|
| Gallery with 50+ images | CSS Grid with `content-visibility: auto` for off-screen items. Pagination (20/page) if gallery exceeds threshold. |
| Image loading | `loading="lazy"` on all thumbnails. IntersectionObserver for blur-up placeholder → full image transition. |
| Upload blocking UI | Async queue processes files sequentially (avoids browser connection limit saturation). UI remains responsive via non-blocking XHR. |
| FileReader memory | `URL.revokeObjectURL(preview)` after upload completes or file removed from queue. |
| Bundle size | react-dropzone is ~8KB gzipped. Imagen module lazy-loaded via `next/dynamic` on product detail page. |
| Mobile gallery | CSS Grid responsive: `grid-template-columns: repeat(auto-fill, minmax(120px, 1fr))`. 2 columns on mobile, 3-4 on desktop. Touch-friendly tap targets (44px min). |

---

## Error Handling

| Scenario | UX Response |
|----------|-------------|
| File too large (>5MB) | DropzoneArea shows inline error: "Archivo muy grande (6.2MB). Máximo 5MB." File NOT added to queue. |
| Invalid file type | DropzoneArea shows inline error: "Formato no soportado. Usa JPEG, PNG o WebP." |
| Upload network error | ProgressBar turns red, toast: "Error al subir {filename}. Reintentar." Retry button per file. |
| Upload server error (4xx) | Toast with server message. File marked `error` in queue. |
| Upload server error (5xx) | Toast: "Error del servidor. Intenta de nuevo." Retry button. |
| Gallery load failure | Error state in ImageGallery with "Reintentar" button. NOT an error boundary — recoverable. |
| Delete image fails | Rollback: image reappears in gallery. Toast: "No se pudo eliminar la imagen." |
| Offline during upload | useOnlineStatus detects offline → upload queue paused, banner: "Sin conexión. Los archivos se subirán cuando vuelva internet." |

---

## Open Questions

- [ ] **API contract**: Does `POST /api/v1/imagenes/upload` accept single file or batch? Design assumes single-file-per-request.
- [ ] **Thumbnail URL**: Does backend return `thumbnailUrl` separate from `url`, or does frontend append query param?
- [ ] **Image ordering**: Can users reorder images? Design assumes chronological order (backend `createdAt`).
- [ ] **Max images per entity**: Any backend limit? Design shows unlimited gallery with pagination.

---

## Summary

- **Approach**: Two modules (`productos`, `imagenes`) following established `animales` patterns — types → services → hooks → components
- **Key Decisions**: 6 documented with tradeoffs (module location, upload queue, gallery placement, preview strategy, entity association, lightbox)
- **Files Affected**: 33 new, 2 modified (query-keys.ts, package.json)
- **Testing Strategy**: Unit (services, hooks, store), Component (forms, gallery, uploader), E2E (full CRUD + upload flow)
