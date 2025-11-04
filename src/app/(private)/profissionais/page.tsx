'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfissionalSection from '@/app/components/profissionais/profissionalSection/ProfissionalSection';

interface Profissional {
  id: string;
  nome: string;
  idImobiliaria: number;
  imobiliaria?: {
    nome: string;
  };
}

export default function Profissionais() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Seção de Profissionais */}
      <ProfissionalSection />
    </div>
  );
}