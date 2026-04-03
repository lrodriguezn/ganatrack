// Colores page
'use client';

import { CatalogoEntityPage } from '@/modules/configuracion/components';
import { CATALOGO_CONFIGS } from '@/modules/configuracion/types/catalogo.types';

export default function ColoresPage(): JSX.Element {
  return <CatalogoEntityPage tipo="colores" config={CATALOGO_CONFIGS.colores} />;
}
