# Loading States Specification

## Purpose

Provide visual loading placeholders for pages and charts to improve perceived performance during data fetching.

## Requirements

### Requirement: Page Skeleton

The system MUST provide a `PageSkeleton` component with props `{ lines?: number, showHeader?: boolean, className?: string }` that renders animated placeholder bars mimicking page content structure. Default: 5 lines, header shown. Each line SHOULD have varying widths (70-100%) to simulate natural content. Animation MUST use a shimmer effect (CSS gradient animation).

#### Scenario: Default page skeleton

- GIVEN PageSkeleton rendered with no props
- THEN 5 placeholder lines displayed with header bar
- AND lines have varying widths between 70% and 100%
- AND shimmer animation is active

#### Scenario: Custom line count

- GIVEN PageSkeleton rendered with `lines={3}`
- THEN exactly 3 placeholder lines displayed (plus header)

#### Scenario: Hide header

- GIVEN PageSkeleton rendered with `showHeader={false}`
- THEN no header placeholder bar is rendered
- AND only the configured number of lines are shown

#### Scenario: Custom className

- GIVEN PageSkeleton rendered with `className="mt-4"`
- THEN the root element has the `mt-4` class applied

#### Scenario: Zero lines

- GIVEN PageSkeleton rendered with `lines={0}` and `showHeader={true}`
- THEN only the header placeholder is rendered
- AND no body lines are displayed

### Requirement: Chart Skeleton

The system MUST provide a `ChartSkeleton` component with props `{ height?: number, className?: string }` that renders an animated placeholder rectangle mimicking a chart container. Default height: 300px. Animation MUST use the same shimmer effect as PageSkeleton for visual consistency.

#### Scenario: Default chart skeleton

- GIVEN ChartSkeleton rendered with no props
- THEN a placeholder rectangle with 300px height is displayed
- AND shimmer animation is active

#### Scenario: Custom height

- GIVEN ChartSkeleton rendered with `height={200}`
- THEN the placeholder rectangle has 200px height

#### Scenario: Custom className

- GIVEN ChartSkeleton rendered with `className="w-full"`
- THEN the root element has the `w-full` class applied

#### Scenario: Minimum height enforcement

- GIVEN ChartSkeleton rendered with `height={0}`
- THEN the placeholder renders with a minimum visible height (at least 50px)
