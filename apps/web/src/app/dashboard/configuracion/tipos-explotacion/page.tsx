// Tipos de Explotación page
'use client';

import { usePredioRequerido } from '@/shared/hooks';
import { CatalogoEntityPage } from '@/modules/configuracion/components';
import { CATALOGO_CONFIGS } from '@/modules/configuracion/types/catalogo.types';

export default function TiposExplotacionPage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  if (predioLoading || !predioActivo) return null;
  return (<CatalogoEntityPage tipo="tipos-explotacion" config={CATALOGO_CONFIGS['tipos-explotacion']} />;
}
