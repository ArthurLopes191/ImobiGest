# Arquitetura do Sistema ImobiGest

## 🏗️ Visão Geral da Arquitetura

O ImobiGest é construído com uma arquitetura moderna baseada em Next.js com App Router, seguindo os princípios de:

- **Separação de Responsabilidades**
- **Componentes Reutilizáveis**
- **Estado Global Gerenciado**
- **Tipagem Forte com TypeScript**

## 📊 Diagrama da Arquitetura

```
┌─────────────────────────────────────────┐
│                Frontend                 │
├─────────────────────────────────────────┤
│  Next.js 15 + React 19 + TypeScript    │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │   Pages     │  │ Components  │      │
│  │             │  │             │      │
│  │ - Login     │  │ - Modals    │      │
│  │ - Home      │  │ - Forms     │      │
│  │ - Vendas    │  │ - Tables    │      │
│  │ - Config    │  │ - Filters   │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Contexts   │  │  Services   │      │
│  │             │  │             │      │
│  │ - Auth      │  │ - API       │      │
│  │ - Theme     │  │ - Utils     │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
│  ┌─────────────────────────────────────┤
│  │           Middleware               │ │
│  │        (Autenticação)              │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    │
                    │ HTTP/JSON
                    ▼
┌─────────────────────────────────────────┐
│                Backend                  │
│              (API REST)                 │
└─────────────────────────────────────────┘
```

## 🗂️ Estrutura de Pastas Detalhada

### `/src/app/`
Estrutura baseada no App Router do Next.js 13+

```
app/
├── (private)/                 # Grupo de rotas protegidas
│   ├── layout.tsx            # Layout das páginas privadas
│   ├── configuracoes/        # Gestão de configurações
│   ├── home/                 # Dashboard principal
│   ├── profissionais/        # Gestão de profissionais
│   └── vendas/               # Gestão de vendas
├── components/               # Componentes reutilizáveis
├── contexts/                 # Contextos React
├── login/                    # Página de autenticação
├── services/                 # Serviços de API
├── layout.tsx                # Layout root da aplicação
├── page.tsx                  # Página inicial
└── globals.css               # Estilos globais
```

### `/src/components/`
Componentes organizados por domínio

```
components/
├── configuracoes/
│   ├── cargoModal/           # Modal de cargos
│   ├── cargoSection/         # Seção de cargos
│   ├── configComissaoModal/  # Modal de configuração de comissões
│   ├── imobiliariaModal/     # Modal de imobiliárias
│   └── imobiliariaSection/   # Seção de imobiliárias
├── header/                   # Cabeçalho da aplicação
├── login/                    # Componentes de login
├── profissionais/           # Componentes de profissionais
├── sidebar/                 # Barra lateral
└── vendas/                  # Componentes de vendas
```

### `/src/types/`
Definições de tipos TypeScript organizadas por domínio

```
types/
├── profissional.ts          # Tipos para profissionais e cargos
└── venda.ts                 # Tipos para vendas e comissões
```

## 🔄 Fluxo de Dados

### 1. Autenticação
```
Login Form → AuthService → API → JWT Token → Cookie → AuthContext
```

### 2. Operações CRUD
```
Component → Hook/Service → API → Database → Response → State Update
```

### 3. Estado Global
```
AuthContext → Providers → Components → Local State
```

## 🧩 Padrões Utilizados

### 1. **Compound Components**
Utilizado nos modais e formulários para maior flexibilidade:

```typescript
<VendaModal>
  <VendaModal.Header />
  <VendaModal.Body />
  <VendaModal.Footer />
</VendaModal>
```

### 2. **Custom Hooks**
Para lógica reutilizável:
- `useVendaSearch` - Busca e filtros de vendas
- `useComissao` - Gerenciamento de comissões
- `useParcelas` - Controle de parcelas

### 3. **Service Layer**
Abstração das chamadas de API:
- `authService` - Operações de autenticação
- API helpers para diferentes recursos

### 4. **Context Pattern**
Gerenciamento de estado global:
- `AuthContext` - Estado de autenticação

## 🔒 Segurança

### Middleware de Autenticação
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token && request.nextUrl.pathname.startsWith('/private')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### Proteção de Rotas
- **Rotas Públicas**: `/login`
- **Rotas Privadas**: Todas em `/(private)`
- **Middleware**: Verifica token JWT em cookies

### Gerenciamento de Tokens
- Armazenamento em cookies HTTPOnly
- Expiração automática
- Renovação de sessão

## 📱 Responsividade

### Breakpoints (TailwindCSS)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

### Estratégia Mobile-First
1. Design para mobile primeiro
2. Progressive enhancement para desktop
3. Componentes adaptativos

## 🎯 Performance

### Otimizações Implementadas
- **Code Splitting** automático com Next.js
- **Turbopack** para builds mais rápidas
- **Tree Shaking** para bundles menores
- **Lazy Loading** de componentes pesados

### Bundle Analysis
```bash
npm run build -- --analyze
```

## 🔄 State Management

### Estratégia de Estado
1. **Local State**: `useState`, `useReducer` para estado de componente
2. **Server State**: React Query para cache de API (futuro)
3. **Global State**: Context API para autenticação
4. **Form State**: React Hook Form para formulários

### Fluxo de Estado
```
API ← Services ← Hooks ← Components
                    ↓
              Local State
                    ↓
            Context (Global)
```

## 🚀 Deploy e Build

### Estratégia de Build
1. **Development**: `npm run dev` com Turbopack
2. **Production**: `npm run build` para otimização
3. **Preview**: `npm start` para testar build

### Variáveis de Ambiente
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 📈 Escalabilidade

### Preparação para Crescimento
1. **Estrutura Modular**: Fácil adição de novos módulos
2. **Tipagem Forte**: Reduz bugs em refatorações
3. **Padrões Consistentes**: Facilita onboarding de novos devs
4. **Documentação**: Código autodocumentado com JSDoc

### Futuras Implementações
- [ ] React Query para gerenciamento de estado servidor
- [ ] Storybook para documentação de componentes
- [ ] Testes automatizados (Jest + Testing Library)
- [ ] PWA capabilities
- [ ] Internacionalização (i18n)

## 🛠️ Ferramentas de Desenvolvimento

### Linting e Formatação
- **ESLint**: Análise estática de código
- **Prettier**: Formatação automática (configuração futura)
- **TypeScript**: Verificação de tipos

### Dev Tools
- **Next.js DevTools**: Debug de performance
- **React DevTools**: Inspeção de componentes
- **TailwindCSS IntelliSense**: Autocomplete de classes

## 📚 Convenções

### Nomenclatura
- **Componentes**: PascalCase (ex: `VendaModal`)
- **Arquivos**: camelCase (ex: `vendaModal.tsx`)
- **Hooks**: camelCase com prefixo `use` (ex: `useVendaSearch`)
- **Tipos**: PascalCase (ex: `VendaData`)

### Estrutura de Arquivos
- Um componente por arquivo
- Índices para exportações limpas
- Co-localização de arquivos relacionados

### Commits
- Conventional Commits
- Mensagens em português
- Commits pequenos e focados