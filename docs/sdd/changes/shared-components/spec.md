# Delta Spec: F2-SHARED — Shared Components

## ADDED Requirements

---

### Requirement: UI Atoms — Input Component

The shared Input component **MUST** render form input fields supporting text, email, password, and number types with consistent styling and validation states.

The system **SHALL** accept the following props:
- `type`: "text" | "email" | "password" | "number" | "textarea"
- `variant`: "default" | "error" | "success" (default: "default")
- `size`: "sm" | "md" | "lg" (default: "md")
- `label`: string (optional)
- `error`: string (optional) — when provided, renders error state and message
- `disabled`: boolean (default: false)
- `className`: string (optional, for twMerge)

The component **MUST** forward ref to the underlying DOM element and use `twMerge` for class composition.

#### Scenario: Basic text input render

- GIVEN a form requiring a name field
- WHEN `<Input name="name" label="Name" />` is rendered
- THEN an input with id="name", associated label "Name", and base classes `flex h-10 rounded-md border bg-background` **MUST** be rendered

#### Scenario: Input with error state

- GIVEN a form with an invalid submitted field
- WHEN `<Input name="email" error="Invalid email format" />` is rendered
- THEN the input border **MUST** be `border-red-500` and error message **MUST** display below in `text-sm text-red-500`

#### Scenario: Disabled input

- GIVEN a form where a field is read-only based on user role
- WHEN `<Input name="id" disabled value="12345" />` is rendered
- THEN the input **MUST** be `opacity-50 cursor-not-allowed pointer-events-none`

#### Scenario: Textarea variant

- GIVEN a form requiring a multi-line description
- WHEN `<Input type="textarea" name="description" />` is rendered
- THEN the element **MUST** be a `<textarea>` with `min-h-[80px]` and resize handling

---

### Requirement: UI Atoms — Skeleton Component

The shared Skeleton component **MUST** render loading placeholder animations for content loading states.

The system **SHALL** accept the following props:
- `width`: string (optional, e.g., "100px" or "100%")
- `height`: string (optional, e.g., "20px" or "2rem")
- `variant`: "text" | "circular" | "rectangular" (default: "rectangular")
- `animation`: "pulse" | "wave" (default: "pulse")
- `className`: string (optional)

#### Scenario: Rectangular pulse skeleton

- GIVEN a data table loading state
- WHEN `<Skeleton className="h-4 w-full" />` is rendered
- THEN a `div` with `animate-pulse bg-muted rounded` **MUST** be rendered at specified dimensions

#### Scenario: Circular avatar skeleton

- GIVEN a user profile loading state
- WHEN `<Skeleton variant="circular" width="40px" height="40px" />` is rendered
- THEN a `div` with `rounded-full` **MUST** be rendered

---

### Requirement: UI Molecules — FormField Component

The FormField component **MUST** integrate React Hook Form's Controller with Zod validation for consistent form handling across the application.

The system **SHALL** accept the following props:
- `name`: string (required) — the field name for RHF registration
- `label`: string (optional) — visible label text
- `rules`: Zod validation rules object (passed to RHF `rules`)
- `render`: render function slot for the input component
- `required`: boolean — when true, appends "(required)" to label

The component **MUST** display Zod validation error messages below the input when validation fails.

#### Scenario: FormField with required validation

- GIVEN a registration form requiring email
- WHEN `<FormField name="email" label="Email" rules={{ required: 'Email is required' }} required render={({ field }) => <Input {...field} />} />` is used
- THEN the label **MUST** display "Email (required)" and submission without value **MUST** trigger error "Email is required"

#### Scenario: FormField with Zod string validation

- GIVEN a login form with email format validation
- WHEN Zod schema `z.string().email()` is passed as `rules`
- AND user types "invalid" and blurs
- THEN error **MUST** display "Invalid email format"

---

### Requirement: UI Molecules — DatePicker Component

The DatePicker component **MUST** wrap flatpickr to provide calendar date selection with Tailwind-styled UI and locale support.

The system **SHALL** accept the following props:
- `value`: Date | string | null (selected date)
- `onChange`: `(date: Date | null) => void` (required)
- `minDate`: Date | string (optional)
- `maxDate`: Date | string (optional)
- `disabled`: boolean (default: false)
- `placeholder`: string (default: "Select date")
- `mode`: "single" | "range" (default: "single")
- `locale`: string (default: "es" for Spanish)
- `className`: string (optional)

The component **MUST** support dark mode via Tailwind `dark:` classes.

#### Scenario: Single date selection

- GIVEN a form requiring appointment date
- WHEN `<DatePicker value={null} onChange={handleChange} placeholder="Select appointment" />` is rendered
- AND user clicks the input
- THEN flatpickr calendar **MUST** open with Spanish locale
- AND on date selection, `onChange` **MUST** be called with the selected Date

#### Scenario: Date range selection

- GIVEN a report form requiring date range
- WHEN `<DatePicker mode="range" onChange={handleRangeChange} />` is rendered
- AND user selects start and end dates
- THEN `onChange` **MUST** be called with an array `[startDate, endDate]`

---

### Requirement: UI Molecules — Pagination Component

The Pagination component **MUST** provide page navigation controls with configurable page size.

The system **SHALL** accept the following props:
- `currentPage`: number (1-indexed, required)
- `totalPages`: number (required)
- `onPageChange`: `(page: number) => void` (required)
- `pageSize`: number (optional, default: 10)
- `pageSizeOptions`: number[] (optional, default: [10, 25, 50, 100])
- `totalItems`: number (optional, for displaying "Showing X-Y of Z")
- `onPageSizeChange`: `(size: number) => void` (optional)

#### Scenario: Pagination navigation

- GIVEN a list with 100 items at 10 items per page
- WHEN `<Pagination currentPage={1} totalPages={10} totalItems={100} onPageChange={handlePage} />` is rendered
- THEN page buttons "1", "2", "3", "...", "10" **MUST** be displayed
- AND clicking page 2 **MUST** call `onPageChange(2)`

#### Scenario: Page size change

- GIVEN a pagination with page size selector
- WHEN user selects "25" from page size dropdown
- THEN `onPageSizeChange(25)` **MUST** be called
- AND component **MUST** reset to page 1

---

### Requirement: UI Organisms — DataTable Component

The DataTable component **MUST** wrap TanStack Table v8 to provide server-side pagination, sorting, and filtering with loading and empty states.

The system **SHALL** accept the following props:
- `columns`: `ColumnDef<TData>[]` (required) — TanStack column definitions
- `data`: `TData[]` (required) — table data
- `pageCount`: number (required for server-side pagination)
- `totalRows`: number (optional, for row count display)
- `isLoading`: boolean (optional, default: false) — shows skeleton rows
- `isFetching`: boolean (optional, default: false) — shows subtle loading indicator
- `onPaginationChange`: `(pagination: { pageIndex: number; pageSize: number }) => void`
- `onSortingChange`: `(sorting: { id: string; desc: boolean }[]) => void`
- `onFilterChange`: `(filters: { id: string; value: string }[]) => void`
- `emptyState`: ReactNode (optional) — custom empty state
- `rowSelection`: RowSelectionState (optional) — controlled row selection
- `onRowSelectionChange`: `(selection: RowSelectionState) => void` (optional)

The skeleton **MUST** render 5 rows of `h-8` skeleton placeholders during loading.

#### Scenario: Server-side pagination

- GIVEN a DataTable configured for server-side pagination
- WHEN `<DataTable columns={cols} data={[]} pageCount={10} onPaginationChange={handlePagination} />` is rendered
- AND user clicks page 2
- THEN `onPaginationChange({ pageIndex: 1, pageSize: 10 })` **MUST** be called

#### Scenario: Loading skeleton

- GIVEN a DataTable with `isLoading={true}`
- THEN 5 skeleton rows **MUST** render with `animate-pulse` and `h-8` height

#### Scenario: Empty state

- GIVEN a DataTable with `data={[]}` and no custom emptyState
- THEN "No hay datos para mostrar" **MUST** be displayed in `text-muted-foreground`

#### Scenario: Row selection with bulk actions

- GIVEN a DataTable with row selection enabled
- WHEN 3 rows are checked
- THEN bulk actions bar **MUST** appear showing "3 elementos seleccionados"

---

### Requirement: UI Organisms — Modal Component

The Modal component **MUST** wrap Radix Dialog to provide accessible modal dialogs with size variants and structured layout.

The system **SHALL** accept the following props:
- `open`: boolean (required) — controls dialog visibility
- `onClose`: `() => void` (required) — called when dialog should close
- `title`: string (required) — dialog title
- `description`: string (optional) — dialog description
- `size`: "sm" | "md" | "lg" | "xl" (default: "md")
- `children`: ReactNode (required) — dialog body content
- `footer`: ReactNode (optional) — footer actions area
- `closeButton`: boolean (default: true) — show X close button

The Modal **MUST**:
- Render with `Radix.Dialog.Root`, `Content`, `Title`, `Description`, `Close`
- Apply size classes: sm=`max-w-sm`, md=`max-w-md`, lg=`max-w-lg`, xl=`max-w-xl`
- Trap focus and handle Escape key
- Close when clicking backdrop (onClose called)

#### Scenario: Basic modal open/close

- GIVEN a modal with `open={true}` and `onClose={handleClose}`
- WHEN Escape key is pressed or backdrop is clicked
- THEN `handleClose` **MUST** be called

#### Scenario: Modal with footer actions

- GIVEN a confirmation modal
- WHEN `<Modal footer={<Button onClick={confirm}>Confirmar</Button>} />` is rendered
- THEN footer content **MUST** render below body content with proper border/spacing

---

### Requirement: Query Infrastructure — QueryClient Configuration

The QueryClient **MUST** be configured with appropriate stale times per data category and retry behavior.

The system **SHALL** export a `queryClient` instance with:
- `staleTime` by operation type:
  - List queries: `30_000` (30 seconds)
  - Detail queries: `300_000` (5 minutes)
  - Catalog/static queries: `Infinity` (never refetch unless explicitly invalidated)
- `retry` strategy:
  - GET queries: `3` retries
  - Mutations: `0` retries (fail fast)
- `refetchOnWindowFocus`: `true` for list queries, `false` for detail/catalog

#### Scenario: List query stale time

- GIVEN a component fetching a list with `useQuery({ queryKey: ['animals', 'list'], queryFn: fetchAnimals })`
- THEN the query **MUST** be considered stale after 30 seconds
- AND won't refetch on window focus within that window

#### Scenario: Mutation retry behavior

- GIVEN a mutation `useMutation({ mutationFn: createAnimal })`
- THEN failed mutation **MUST NOT** retry automatically (retry: 0)

---

### Requirement: Query Infrastructure — QueryKeys Factory

The QueryKeys factory **MUST** provide centralized, type-safe query key generation following TanStack Query best practices.

The system **SHALL** export a factory pattern per module:
```typescript
const createQueryKeys = <T extends string>(module: T) => ({
  all: [module] as const,
  lists: () => [...module, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...module, 'list', filters] as const,
  details: () => [...module, 'detail'] as const,
  detail: (id: string | number) => [...module, 'detail', id] as const,
})
```

#### Scenario: Generate list keys

- GIVEN `const animalKeys = createQueryKeys('animals')`
- WHEN `animalKeys.lists()` is called
- THEN `['animals', 'list']` **MUST** be returned

#### Scenario: Generate filtered list keys

- GIVEN `animalKeys.list({ status: 'active', page: 1 })`
- THEN `['animals', 'list', { status: 'active', page: 1 }]` **MUST** be returned

#### Scenario: Generate detail key

- GIVEN `animalKeys.detail(123)`
- THEN `['animals', 'detail', 123]` **MUST** be returned

---

### Requirement: Shared Hooks — useDebounce

The useDebounce hook **MUST** return a debounced value with configurable delay using generic typing.

The system **SHALL** accept:
- `value: T` — the value to debounce (generic type)
- `delay: number` — debounce delay in milliseconds (default: 500)

And return: `T` — the debounced value

The implementation **MUST**:
- Use `useEffect` to update the debounced value after delay
- Cancel pending timeouts on value change (cleanup)
- Support any type T

#### Scenario: Debounce text input

- GIVEN `const debouncedSearch = useDebounce(searchTerm, 300)`
- WHEN user types "dog" rapidly within 300ms
- THEN `debouncedSearch` **MUST** only update to "dog" after 300ms of no typing

---

### Requirement: Shared Hooks — useOnlineStatus

The useOnlineStatus hook **MUST** report browser online/offline status as a boolean.

The system **SHALL**:
- Return `boolean` — true if online, false if offline
- Listen to `window.online` and `window.offline` events
- Initialize with `navigator.onLine` value
- Handle SSR safely (return true on server)

#### Scenario: Detect offline status

- GIVEN `const isOnline = useOnlineStatus()`
- WHEN browser loses network connectivity
- THEN `isOnline` **MUST** immediately become `false`
- AND `window.addEventListener('offline', ...)` **MUST** have been called

#### Scenario: Detect online status recovery

- GIVEN `isOnline` is `false`
- WHEN network connectivity is restored
- THEN `isOnline` **MUST** become `true`

---

## Acceptance Criteria Summary

| Component | Must Pass |
|----------|----------|
| Input | Renders all types, variants, sizes; error state displays; disabled blocks interaction |
| Skeleton | Pulse/wave animation; circular/rectangular/text variants |
| FormField | RHF integration works; Zod errors display; required indicator |
| DatePicker | Calendar opens; single/range selection; Spanish locale; dark mode |
| Pagination | Page navigation; page size selector; correct callbacks |
| DataTable | Server-side pagination/sort/filter; skeleton loading; empty state; row selection |
| Modal | Opens/closes; all sizes work; Escape/backdrop close; footer renders |
| QueryClient | Correct staleTimes per type; retry behavior correct |
| QueryKeys | All factory methods return correct key arrays |
| useDebounce | Value debounced correctly; generic type preserved |
| useOnlineStatus | Returns correct boolean; events subscribed |

---

**Spec artifact**: `sdd/shared-components/spec`
**Project**: ganatrack
**Change**: F2-SHARED
**Created**: 2026-04-02
