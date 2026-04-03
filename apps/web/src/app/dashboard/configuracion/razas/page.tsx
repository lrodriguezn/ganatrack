// Razas page
'use client';

import { CatalogoEntityPage } from '@/modules/configuracion/components';
import { CATALOGO_CONFIGS } from '@/modules/configuracion/types/catalogo.types';

export default function RazasPage(): JSX.Element {
  return <CatalogoEntityPage tipo="razas" config={CATALOGO_CONFIGS.razas} />;
}
