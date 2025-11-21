'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VendaSection from '@/app/components/vendas/vendaSection/VendaSection';
import VendaSectionWithFilters from '@/app/components/vendas/vendaSection/VendaSectionWithFilters';

interface Venda {
  id: string;
  descricaoImovel: string;
  valorTotal: number;
  dataVenda: string;
  formaPagamento: 'A_VISTA' | 'PARCELADO';
  qtdParcelas: number;
  compradorNome: string;
  compradorContato: string;
  idImobiliaria: number;
  imobiliaria?: {
    nome: string;
  };
}

export default function Vendas() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Seção de Vendas */}
      {/* <VendaSection /> */}
      <VendaSectionWithFilters />
    </div>
  );
}