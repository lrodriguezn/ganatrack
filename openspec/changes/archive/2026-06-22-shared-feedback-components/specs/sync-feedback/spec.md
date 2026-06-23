# Sync Feedback Specification

## Purpose

Provide visual feedback for data synchronization status and conflict resolution in offline-first scenarios.

## Requirements

### Requirement: Sync Status Indicator

The system MUST provide a `SyncStatusIndicator` component with props `{ pendingCount: number, className?: string }` that displays the current sync status. When `pendingCount > 0`, it MUST show a warning indicator with the count of pending items. When `pendingCount === 0`, it MUST show a success indicator confirming all data is synced. The component SHOULD use a sync icon that animates (rotates) when pending items exist.

#### Scenario: Pending items exist

- GIVEN SyncStatusIndicator rendered with `pendingCount={5}`
- THEN a warning-colored indicator is displayed
- AND the number "5" is visible
- AND a sync icon with rotation animation is shown
- AND tooltip or label reads "5 cambios pendientes de sincronización"

#### Scenario: All synced

- GIVEN SyncStatusIndicator rendered with `pendingCount={0}`
- THEN a success-colored indicator is displayed
- AND no rotation animation is active
- AND label reads "Todo sincronizado"

#### Scenario: Custom className

- GIVEN SyncStatusIndicator rendered with `pendingCount={2}` and `className="ml-2"`
- THEN the root element has the `ml-2` class applied

#### Scenario: Large pending count

- GIVEN SyncStatusIndicator rendered with `pendingCount={999}`
- THEN the full count "999" is displayed (no truncation)

### Requirement: Sync Conflict Toast

The system MUST provide a `SyncConflictToast` component with props `{ count: number, onDiscardAll: () => void, onResolveAll: () => void }` that renders a toast notification for sync conflicts. It MUST display the number of conflicting items and provide two action buttons: "Descartar todo" (calls onDiscardAll) and "Resolver todo" (calls onResolveAll). The toast SHOULD use a warning color scheme and MUST NOT auto-dismiss (user must take action).

#### Scenario: Display conflict toast

- GIVEN SyncConflictToast rendered with `count={3}`
- THEN a warning-colored toast is displayed
- AND the number "3" is visible in the message
- AND message reads "3 conflictos de sincronización detectados"

#### Scenario: Discard all action

- GIVEN SyncConflictToast rendered with `count={3}`
- WHEN user clicks "Descartar todo" button
- THEN `onDiscardAll` callback is invoked

#### Scenario: Resolve all action

- GIVEN SyncConflictToast rendered with `count={3}`
- WHEN user clicks "Resolver todo" button
- THEN `onResolveAll` callback is invoked

#### Scenario: No auto-dismiss

- GIVEN SyncConflictToast rendered
- THEN the toast does NOT auto-dismiss
- AND remains visible until user clicks an action button

#### Scenario: Single conflict

- GIVEN SyncConflictToast rendered with `count={1}`
- THEN message reads "1 conflicto de sincronización detectado" (singular form)

#### Scenario: Zero count edge case

- GIVEN SyncConflictToast rendered with `count={0}`
- THEN the component renders nothing or an empty state indicating no conflicts
