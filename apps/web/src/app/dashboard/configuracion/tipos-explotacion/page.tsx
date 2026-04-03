// Tipos de Explotación page
'use client';

import { CatalogoEntityPage } from '@/modules/configuracion/components';
import { CATALOGO_CONFIGS } from '@/modules/configuracion/types/catalogo.types';

export default function TiposExplotacionPage(): JSX.Element {
  return <CatalogoEntityPage tipo="tipos-explotacion" config={CATALOGO_CONFIGS['tipos-explotacion']} />;
}
