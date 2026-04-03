// Calidad Animal page
'use client';

import { CatalogoEntityPage } from '@/modules/configuracion/components';
import { CATALOGO_CONFIGS } from '@/modules/configuracion/types/catalogo.types';

export default function CalidadAnimalPage(): JSX.Element {
  return <CatalogoEntityPage tipo="calidad-animal" config={CATALOGO_CONFIGS['calidad-animal']} />;
}
