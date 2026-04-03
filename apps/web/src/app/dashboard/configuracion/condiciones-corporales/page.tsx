// Condiciones Corporales page
'use client';

import { CatalogoEntityPage } from '@/modules/configuracion/components';
import { CATALOGO_CONFIGS } from '@/modules/configuracion/types/catalogo.types';

export default function CondicionesCorporalesPage(): JSX.Element {
  return <CatalogoEntityPage tipo="condiciones-corporales" config={CATALOGO_CONFIGS['condiciones-corporales']} />;
}
