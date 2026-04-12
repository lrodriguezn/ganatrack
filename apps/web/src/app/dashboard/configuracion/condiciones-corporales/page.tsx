// Condiciones Corporales page
'use client';

import { usePredioRequerido } from '@/shared/hooks';
import { CatalogoEntityPage } from '@/modules/configuracion/components';
import { CATALOGO_CONFIGS } from '@/modules/configuracion/types/catalogo.types';

export default function CondicionesCorporalesPage(): JSX.Element | null {
  const { predioActivo, isLoading: predioLoading } = usePredioRequerido();
  if (predioLoading || !predioActivo) return null;
  return (<CatalogoEntityPage tipo="condiciones-corporales" config={CATALOGO_CONFIGS['condiciones-corporales']} />;
}
