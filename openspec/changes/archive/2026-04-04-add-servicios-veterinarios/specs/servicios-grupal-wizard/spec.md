# Delta for Servicios Grupal Wizard

## MODIFIED Requirements

### Requirement: Wizard Type Union

The `ServicioGrupalWizard` component MUST accept `'palpacion' | 'inseminacion' | 'veterinario'` as its `type` prop.
(Previously: only accepted `'palpacion' | 'inseminacion'`)

#### Scenario: Wizard renders with veterinary type

- GIVEN the wizard receives `type="veterinario"`
- WHEN the component renders
- THEN the title MUST display "Nuevo Servicio Veterinario"
- AND all 3 steps (Crear Evento, Seleccionar Animales, Registrar Resultados) MUST render identically to existing types
- AND existing `'palpacion'` and `'inseminacion'` types MUST continue to work unchanged

#### Scenario: TypeScript enforces valid type values

- GIVEN a developer passes `type="invalid"` to the wizard
- WHEN TypeScript compiles
- THEN it MUST produce a type error because `"invalid"` is not assignable to the union
