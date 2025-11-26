# ImobiGest 🏠

Sistema de gestão de comissões imobiliárias desenvolvido com Next.js, React e TypeScript.

## 📋 Sobre o Projeto

ImobiGest é um sistema completo para gestão de vendas imobiliárias e controle de comissões de profissionais do setor imobiliário. O sistema permite gerenciar imobiliárias, profissionais, vendas e o controle detalhado de comissões e parcelas.

## ✨ Funcionalidades

### 🏢 Gestão de Imobiliárias
- Cadastro e edição de imobiliárias
- Configuração de metas de vendas
- Associação de profissionais à imobiliária

### 👥 Gestão de Profissionais
- Cadastro de profissionais por imobiliária
- Gerenciamento de cargos e funções
- Configuração automática de comissões por cargo

### 💰 Gestão de Vendas
- Registro completo de vendas (à vista ou parcelado)
- Controle de parcelas e vencimentos
- Sistema de filtros avançados
- Status de pagamento (Pendente, Pago, Atrasado)

### 📊 Sistema de Comissões
- Cálculo automático de comissões por cargo
- Configuração personalizada de percentuais
- Associação de múltiplos profissionais por venda
- Controle de comissões por parcela

### 🔒 Autenticação e Segurança
- Sistema de login com JWT
- Middleware de proteção de rotas
- Gerenciamento de sessões

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 15.5.3** - Framework React para produção
- **React 19.1.0** - Biblioteca para interfaces de usuário
- **TypeScript 5** - Tipagem estática
- **TailwindCSS 4** - Framework CSS utilitário
- **React Hook Form 7.64.0** - Gerenciamento de formulários
- **Zod 4.1.12** - Validação de esquemas
- **React Icons 5.5.0** - Biblioteca de ícones

### Ferramentas de Desenvolvimento
- **ESLint 9** - Linting de código
- **PostCSS** - Processamento de CSS
- **js-cookie** - Gerenciamento de cookies
- **Turbopack** - Build tool otimizado

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (private)/           # Rotas protegidas
│   │   ├── configuracoes/   # Página de configurações
│   │   ├── home/           # Dashboard principal
│   │   ├── profissionais/  # Gestão de profissionais
│   │   └── vendas/         # Gestão de vendas
│   ├── components/         # Componentes reutilizáveis
│   │   ├── configuracoes/  # Componentes de configuração
│   │   ├── header/         # Cabeçalho da aplicação
│   │   ├── login/          # Componentes de autenticação
│   │   ├── profissionais/  # Componentes de profissionais
│   │   ├── sidebar/        # Barra lateral de navegação
│   │   └── vendas/         # Componentes de vendas
│   ├── contexts/           # Contextos React
│   ├── login/             # Página de login
│   └── services/          # Serviços de API
├── middleware.ts          # Middleware de autenticação
└── types/                # Definições de tipos TypeScript
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Backend API rodando

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/ArthurLopes191/ImobiGest.git
cd ImobiGest
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

5. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## 🏗️ Scripts Disponíveis

```bash
# Desenvolvimento com Turbopack
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Linting do código
npm run lint
```

## 📚 Documentação das APIs

### Endpoints Principais

#### Profissionais por Imobiliária
```http
GET /profissional/imobiliaria/{idImobiliaria}
```

#### Busca de Vendas
```http
GET /vendas/search?q={termo}&idImobiliaria={id}&status={status}
```

Para mais detalhes, consulte:
- [`ENDPOINT_PROFISSIONAIS_POR_IMOBILIARIA.md`](./ENDPOINT_PROFISSIONAIS_POR_IMOBILIARIA.md)
- [`ENDPOINT_SEARCH_VENDAS.md`](./ENDPOINT_SEARCH_VENDAS.md)

## 💾 Tipos de Dados

### Principais Interfaces

#### Profissional
```typescript
interface Profissional {
  id: number;
  nome: string;
  idImobiliaria: number;
  imobiliaria: Imobiliaria;
  cargos: Cargo[];
}
```

#### Venda
```typescript
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
}
```

## 🔐 Autenticação

O sistema utiliza autenticação baseada em JWT com as seguintes características:

- **Cookies seguros** para armazenamento do token
- **Middleware** para proteção de rotas privadas
- **Context API** para gerenciamento global do estado de autenticação
- **Expiração** automática de sessões

## 🎨 Interface do Usuário

### Características do Design
- **Design Responsivo** com TailwindCSS
- **Componentes Modulares** e reutilizáveis
- **Formulários Validados** com React Hook Form e Zod
- **Feedback Visual** em tempo real
- **Navegação Intuitiva** com sidebar e header

### Páginas Principais
- **Login** - Autenticação de usuários
- **Dashboard** - Visão geral do sistema
- **Configurações** - Gestão de imobiliárias e cargos
- **Profissionais** - CRUD de profissionais
- **Vendas** - Gestão completa de vendas e comissões

## 🔄 Fluxo de Trabalho

1. **Login** no sistema
2. **Configurar** imobiliárias e cargos
3. **Cadastrar** profissionais
4. **Registrar** vendas
5. **Gerenciar** comissões e parcelas
6. **Acompanhar** status de pagamentos

## 📖 Parcelas e Comissões

O sistema possui um controle detalhado de parcelas documentado em [`PARCELAS_README.md`](./PARCELAS_README.md), incluindo:

- Geração automática de parcelas
- Controle de vencimentos
- Status de pagamento
- Cálculo de comissões por parcela

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença especificada no arquivo [`LICENSE`](./LICENSE).

## 👨‍💻 Desenvolvedor

Desenvolvido por [Arthur Lopes](https://github.com/ArthurLopes191)

---

Para mais informações sobre Next.js, consulte a [documentação oficial](https://nextjs.org/docs).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
