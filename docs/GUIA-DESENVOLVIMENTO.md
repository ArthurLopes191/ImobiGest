# Guia de Desenvolvimento - ImobiGest

## 🚀 Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ (recomendado: v20)
- npm 9+ ou yarn 3+
- Git
- Editor com suporte TypeScript (VS Code recomendado)

### Setup Inicial

1. **Clone e Instalação**
```bash
git clone https://github.com/ArthurLopes191/ImobiGest.git
cd ImobiGest
npm install
```

2. **Configuração de Ambiente**
```bash
# Crie o arquivo .env.local
cp .env.example .env.local

# Configure as variáveis
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

3. **Executar em Desenvolvimento**
```bash
npm run dev
```

## 🏗️ Adicionando Novas Features

### 1. Criando um Novo Módulo

#### Estrutura Recomendada
```
src/app/components/[modulo]/
├── [moduloModal]/
│   ├── [Modulo]Modal.tsx
│   ├── use[Modulo]Form.ts
│   └── index.ts
├── [moduloSection]/
│   ├── [Modulo]Section.tsx
│   ├── [Modulo]Table.tsx
│   └── index.ts
└── index.ts
```

#### Exemplo: Criando Módulo "Contratos"

1. **Definir Tipos** (`src/types/contrato.ts`):
```typescript
export interface Contrato {
  id: string;
  numero: string;
  dataInicio: string;
  dataFim: string;
  valor: number;
  idVenda: string;
  status: 'ATIVO' | 'INATIVO' | 'VENCIDO';
}

export interface ContratoData {
  numero: string;
  dataInicio: string;
  dataFim: string;
  valor: number;
  idVenda: string;
}
```

2. **Criar Hook Personalizado** (`src/app/components/contratos/hooks/useContrato.ts`):
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Contrato, ContratoData } from '@/types/contrato';

export const useContrato = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContratos = async () => {
    setIsLoading(true);
    try {
      // Implementar chamada API
      const response = await fetch('/api/contratos');
      const data = await response.json();
      setContratos(data);
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createContrato = async (data: ContratoData) => {
    try {
      const response = await fetch('/api/contratos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        await fetchContratos();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao criar contrato:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchContratos();
  }, []);

  return {
    contratos,
    isLoading,
    createContrato,
    fetchContratos
  };
};
```

3. **Criar Componente Modal** (`src/app/components/contratos/contratoModal/ContratoModal.tsx`):
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ContratoData } from '@/types/contrato';

const contratoSchema = z.object({
  numero: z.string().min(1, 'Número é obrigatório'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  idVenda: z.string().min(1, 'Venda é obrigatória')
});

interface ContratoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContratoData) => Promise<boolean>;
}

export const ContratoModal = ({ isOpen, onClose, onSubmit }: ContratoModalProps) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContratoData>({
    resolver: zodResolver(contratoSchema)
  });

  const handleFormSubmit = async (data: ContratoData) => {
    const success = await onSubmit(data);
    if (success) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4">Novo Contrato</h2>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Número</label>
            <input
              {...register('numero')}
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: CTR-001"
            />
            {errors.numero && (
              <span className="text-red-500 text-sm">{errors.numero.message}</span>
            )}
          </div>

          {/* Outros campos... */}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

4. **Criar Página** (`src/app/(private)/contratos/page.tsx`):
```typescript
'use client';

import { useState } from 'react';
import { useContrato } from '../components/contratos/hooks/useContrato';
import { ContratoModal } from '../components/contratos/contratoModal/ContratoModal';

export default function ContratosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { contratos, isLoading, createContrato } = useContrato();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contratos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Novo Contrato
        </button>
      </div>

      {/* Tabela de contratos */}
      <div className="bg-white rounded-lg shadow">
        {/* Implementar tabela */}
      </div>

      <ContratoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createContrato}
      />
    </div>
  );
}
```

### 2. Validação com Zod

#### Schemas Reutilizáveis
```typescript
// src/schemas/common.ts
import { z } from 'zod';

export const dateSchema = z.string()
  .refine(date => !isNaN(Date.parse(date)), 'Data inválida');

export const currencySchema = z.number()
  .min(0, 'Valor deve ser positivo')
  .transform(val => Math.round(val * 100) / 100); // Arredondar para 2 casas

export const phoneSchema = z.string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999');
```

#### Uso em Formulários
```typescript
import { dateSchema, currencySchema } from '@/schemas/common';

const vendaSchema = z.object({
  descricaoImovel: z.string().min(3, 'Mínimo 3 caracteres'),
  valorTotal: currencySchema,
  dataVenda: dateSchema,
  // ...outros campos
});
```

### 3. Gerenciamento de Estado

#### Estado Local vs Global
```typescript
// ✅ Estado Local - Dados específicos do componente
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState({});

// ✅ Estado Global - Dados compartilhados
const { user, isAuthenticated } = useAuth();
```

#### Custom Hooks para Lógica Complexa
```typescript
// src/hooks/useAsyncOperation.ts
export const useAsyncOperation = <T>() => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (operation: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, execute };
};
```

### 4. Estilização com TailwindCSS

#### Classes Comuns (Criar componente base)
```typescript
// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) => {
  const baseClasses = 'font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
};
```

### 5. Tratamento de Erros

#### Error Boundary para Componentes
```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-2">Algo deu errado!</h2>
      <pre className="text-sm text-gray-600 mb-4">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
};
```

#### Toast Notifications (Futuro)
```typescript
// src/hooks/useToast.ts
export const useToast = () => {
  const showSuccess = (message: string) => {
    // Implementar toast de sucesso
  };

  const showError = (message: string) => {
    // Implementar toast de erro
  };

  return { showSuccess, showError };
};
```

## 🧪 Testes (Configuração Futura)

### Setup de Testes
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

### Exemplo de Teste
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📝 Convenções de Código

### 1. Nomenclatura
- **Componentes**: `PascalCase` (ex: `VendaModal`)
- **Hooks**: `camelCase` com prefixo `use` (ex: `useVendaSearch`)
- **Utilitários**: `camelCase` (ex: `formatCurrency`)
- **Constantes**: `SNAKE_CASE` (ex: `API_BASE_URL`)

### 2. Estrutura de Arquivos
```typescript
// ✅ Exportações nomeadas
export const VendaModal = () => { ... };
export const useVendaForm = () => { ... };

// ✅ Export default para páginas
export default function VendasPage() { ... }

// ✅ Índices para exportações limpas
// index.ts
export { VendaModal } from './VendaModal';
export { useVendaForm } from './useVendaForm';
```

### 3. TypeScript
```typescript
// ✅ Interfaces para objetos
interface User {
  id: string;
  name: string;
}

// ✅ Types para uniões
type Status = 'pending' | 'approved' | 'rejected';

// ✅ Generics quando necessário
interface ApiResponse<T> {
  data: T;
  success: boolean;
}
```

### 4. Imports
```typescript
// ✅ Ordem recomendada
import React from 'react';                    // React
import { useForm } from 'react-hook-form';   // Bibliotecas externas
import { Button } from '@/components/ui';    // Componentes internos
import { User } from '@/types';              // Types
import { formatCurrency } from '@/utils';    // Utilitários
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Build Manual
```bash
npm run build
npm start
```

## 🔧 Utilitários Úteis

### Formatação de Dados
```typescript
// src/utils/formatters.ts
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};
```

### Helpers de API
```typescript
// src/utils/api.ts
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return 'Erro interno do servidor';
};

export const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
};
```

## 📚 Recursos Adicionais

### VS Code Extensions Recomendadas
- TypeScript Importer
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Bracket Pair Colorizer

### Scripts Úteis
```bash
# Análise de bundle
npm run build -- --analyze

# Verificação de tipos
npx tsc --noEmit

# Linting
npm run lint -- --fix
```

### Links Úteis
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)