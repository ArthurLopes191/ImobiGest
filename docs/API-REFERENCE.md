# API Reference - ImobiGest

## 🌐 Visão Geral da API

A API do ImobiGest segue os padrões REST e utiliza JSON para comunicação. Todas as rotas protegidas requerem autenticação via JWT token.

### Base URL
```
http://localhost:3001
```

### Autenticação
Todas as requisições para rotas protegidas devem incluir o token JWT no header:
```
Authorization: Bearer <token>
```

## 🔐 Autenticação

### Login
**POST** `/auth/login`

Autentica um usuário e retorna um token JWT.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "role": "admin"
  }
}
```

**Error Responses:**
- `401` - Credenciais inválidas
- `400` - Dados de entrada inválidos

### Logout
**POST** `/auth/logout`

Invalida o token atual.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

## 🏢 Imobiliárias

### Listar Imobiliárias
**GET** `/imobiliaria`

**Response:**
```json
[
  {
    "id": 1,
    "nome": "Imobiliária Central",
    "meta": 100000.00,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Criar Imobiliária
**POST** `/imobiliaria`

**Request Body:**
```json
{
  "nome": "Nova Imobiliária",
  "meta": 150000.00
}
```

**Response:**
```json
{
  "id": 2,
  "nome": "Nova Imobiliária",
  "meta": 150000.00,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Obter Imobiliária por ID
**GET** `/imobiliaria/{id}`

**Response:**
```json
{
  "id": 1,
  "nome": "Imobiliária Central",
  "meta": 100000.00,
  "profissionais": [
    {
      "id": 1,
      "nome": "João Silva",
      "cargos": ["Vendedor", "Gerente"]
    }
  ]
}
```

### Atualizar Imobiliária
**PUT** `/imobiliaria/{id}`

**Request Body:**
```json
{
  "nome": "Imobiliária Central Atualizada",
  "meta": 120000.00
}
```

### Deletar Imobiliária
**DELETE** `/imobiliaria/{id}`

**Response:**
```json
{
  "message": "Imobiliária deletada com sucesso"
}
```

## 👥 Profissionais

### Listar Profissionais
**GET** `/profissional`

**Query Parameters:**
- `idImobiliaria` (optional) - Filtrar por imobiliária

**Response:**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "idImobiliaria": 1,
    "imobiliaria": {
      "id": 1,
      "nome": "Imobiliária Central"
    },
    "cargos": [
      {
        "id": 1,
        "nome": "Vendedor",
        "comissaoAutomatica": true
      }
    ]
  }
]
```

### Listar Profissionais por Imobiliária
**GET** `/profissional/imobiliaria/{idImobiliaria}`

**Response:**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "cargos": [
      {
        "id": 1,
        "nome": "Vendedor",
        "comissaoAutomatica": true
      }
    ]
  }
]
```

### Criar Profissional
**POST** `/profissional`

**Request Body:**
```json
{
  "nome": "Maria Santos",
  "idImobiliaria": 1,
  "cargos": [1, 2]
}
```

**Response:**
```json
{
  "id": 2,
  "nome": "Maria Santos",
  "idImobiliaria": 1,
  "cargos": [
    {
      "id": 1,
      "nome": "Vendedor",
      "comissaoAutomatica": true
    }
  ]
}
```

### Obter Profissional por ID
**GET** `/profissional/{id}`

### Atualizar Profissional
**PUT** `/profissional/{id}`

### Deletar Profissional
**DELETE** `/profissional/{id}`

## 💼 Cargos

### Listar Cargos
**GET** `/cargo`

**Response:**
```json
[
  {
    "id": 1,
    "nome": "Vendedor",
    "comissaoAutomatica": true,
    "percentualComissao": 3.5
  }
]
```

### Criar Cargo
**POST** `/cargo`

**Request Body:**
```json
{
  "nome": "Coordenador de Vendas",
  "comissaoAutomatica": false,
  "percentualComissao": 2.0
}
```

### Atualizar Cargo
**PUT** `/cargo/{id}`

### Deletar Cargo
**DELETE** `/cargo/{id}`

## 💰 Vendas

### Listar Vendas
**GET** `/venda`

**Query Parameters:**
- `page` (optional) - Página (default: 1)
- `limit` (optional) - Itens por página (default: 10)
- `idImobiliaria` (optional) - Filtrar por imobiliária
- `status` (optional) - Filtrar por status
- `dataInicio` (optional) - Data início (YYYY-MM-DD)
- `dataFim` (optional) - Data fim (YYYY-MM-DD)

**Response:**
```json
{
  "data": [
    {
      "id": "1",
      "descricaoImovel": "Apartamento 3 quartos",
      "valorTotal": 250000.00,
      "dataVenda": "2024-01-15",
      "formaPagamento": "PARCELADO",
      "qtdParcelas": 12,
      "compradorNome": "Pedro Costa",
      "compradorContato": "(11) 99999-9999",
      "idImobiliaria": 1,
      "imobiliaria": {
        "nome": "Imobiliária Central"
      },
      "comissoes": [
        {
          "id": "1",
          "idProfissional": 1,
          "tipoComissao": "PERCENTUAL",
          "valor": 8750.00,
          "profissional": {
            "nome": "João Silva"
          }
        }
      ],
      "parcelas": [
        {
          "id": 1,
          "numeroParcela": 1,
          "valorParcela": 20833.33,
          "dataVencimento": "2024-02-15",
          "status": "PAGO"
        }
      ]
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

### Buscar Vendas
**GET** `/venda/search`

**Query Parameters:**
- `q` (required) - Termo de busca
- `idImobiliaria` (optional) - Filtrar por imobiliária
- `status` (optional) - Filtrar por status

**Response:**
```json
[
  {
    "id": "1",
    "descricaoImovel": "Apartamento 3 quartos",
    "compradorNome": "Pedro Costa",
    "valorTotal": 250000.00,
    "dataVenda": "2024-01-15"
  }
]
```

### Criar Venda
**POST** `/venda`

**Request Body:**
```json
{
  "descricaoImovel": "Casa 4 quartos",
  "valorTotal": 400000.00,
  "dataVenda": "2024-01-20",
  "formaPagamento": "PARCELADO",
  "qtdParcelas": 6,
  "compradorNome": "Ana Silva",
  "compradorContato": "(11) 88888-8888",
  "idImobiliaria": 1,
  "comissoes": [
    {
      "idProfissional": 1,
      "idsCargos": [1],
      "tipoComissao": "PERCENTUAL",
      "valor": 14000.00
    }
  ],
  "parcelas": [
    {
      "numeroParcela": 1,
      "valorParcela": 66666.67,
      "dataVencimento": "2024-02-20",
      "status": "PENDENTE"
    }
  ]
}
```

### Obter Venda por ID
**GET** `/venda/{id}`

### Atualizar Venda
**PUT** `/venda/{id}`

### Deletar Venda
**DELETE** `/venda/{id}`

## 📊 Comissões

### Listar Comissões
**GET** `/comissao`

**Query Parameters:**
- `idVenda` (optional) - Filtrar por venda
- `idProfissional` (optional) - Filtrar por profissional

**Response:**
```json
[
  {
    "id": "1",
    "idVenda": 1,
    "idProfissional": 1,
    "idsCargos": [1],
    "tipoComissao": "PERCENTUAL",
    "valor": 8750.00,
    "percentual": 3.5,
    "venda": {
      "descricaoImovel": "Apartamento 3 quartos",
      "valorTotal": 250000.00
    },
    "profissional": {
      "nome": "João Silva"
    },
    "cargos": [
      {
        "nome": "Vendedor"
      }
    ]
  }
]
```

### Criar Comissão
**POST** `/comissao`

**Request Body:**
```json
{
  "idVenda": 1,
  "idProfissional": 1,
  "idsCargos": [1, 2],
  "tipoComissao": "VALOR_FIXO",
  "valor": 5000.00
}
```

### Atualizar Comissão
**PUT** `/comissao/{id}`

### Deletar Comissão
**DELETE** `/comissao/{id}`

## 💳 Parcelas

### Listar Parcelas
**GET** `/parcela`

**Query Parameters:**
- `idVenda` (optional) - Filtrar por venda
- `status` (optional) - Filtrar por status
- `vencimentoInicio` (optional) - Data início vencimento
- `vencimentoFim` (optional) - Data fim vencimento

**Response:**
```json
[
  {
    "id": 1,
    "numeroParcela": 1,
    "valorParcela": 20833.33,
    "dataVencimento": "2024-02-15",
    "status": "PAGO",
    "idVenda": 1,
    "venda": {
      "descricaoImovel": "Apartamento 3 quartos",
      "compradorNome": "Pedro Costa"
    }
  }
]
```

### Atualizar Status da Parcela
**PATCH** `/parcela/{id}/status`

**Request Body:**
```json
{
  "status": "PAGO"
}
```

### Gerar Parcelas para Venda
**POST** `/parcela/gerar/{idVenda}`

**Response:**
```json
{
  "message": "Parcelas geradas com sucesso",
  "parcelas": [
    {
      "numeroParcela": 1,
      "valorParcela": 20833.33,
      "dataVencimento": "2024-02-15"
    }
  ]
}
```

## 📈 Dashboard e Relatórios

### Estatísticas Gerais
**GET** `/dashboard/stats`

**Query Parameters:**
- `idImobiliaria` (optional) - Filtrar por imobiliária
- `periodo` (optional) - mensal|trimestral|anual

**Response:**
```json
{
  "totalVendas": 1250000.00,
  "qtdVendas": 15,
  "totalComissoes": 43750.00,
  "metaAtingida": 85.5,
  "vendasPorMes": [
    {
      "mes": "2024-01",
      "total": 450000.00,
      "quantidade": 3
    }
  ],
  "topProfissionais": [
    {
      "nome": "João Silva",
      "totalComissoes": 15000.00,
      "qtdVendas": 5
    }
  ]
}
```

### Relatório de Comissões
**GET** `/relatorio/comissoes`

**Query Parameters:**
- `dataInicio` (required) - Data início (YYYY-MM-DD)
- `dataFim` (required) - Data fim (YYYY-MM-DD)
- `idImobiliaria` (optional) - Filtrar por imobiliária
- `idProfissional` (optional) - Filtrar por profissional

**Response:**
```json
{
  "periodo": {
    "inicio": "2024-01-01",
    "fim": "2024-01-31"
  },
  "resumo": {
    "totalComissoes": 43750.00,
    "qtdVendas": 8,
    "valorTotalVendas": 1250000.00
  },
  "por_profissional": [
    {
      "profissional": {
        "id": 1,
        "nome": "João Silva"
      },
      "totalComissoes": 15000.00,
      "qtdVendas": 3,
      "detalhes": [
        {
          "venda": {
            "id": "1",
            "descricaoImovel": "Apartamento 3 quartos",
            "valorTotal": 250000.00
          },
          "comissao": 8750.00,
          "percentual": 3.5
        }
      ]
    }
  ]
}
```

## ⚠️ Códigos de Erro

### Códigos HTTP Comuns
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Recurso não encontrado
- `409` - Conflito (duplicação)
- `422` - Dados inválidos
- `500` - Erro interno do servidor

### Formato de Erro Padrão
```json
{
  "error": {
    "message": "Descrição do erro",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": ["Campo obrigatório"]
    }
  }
}
```

### Códigos de Erro Específicos
- `AUTH_001` - Token inválido
- `AUTH_002` - Token expirado
- `VALIDATION_001` - Dados de entrada inválidos
- `BUSINESS_001` - Regra de negócio violada
- `NOT_FOUND_001` - Recurso não encontrado
- `DUPLICATE_001` - Recurso já existe

## 🔄 Versionamento

### Headers de Versionamento
```
API-Version: 1.0
```

### URLs Versionadas
```
/api/v1/venda
/api/v2/venda (futuro)
```

## 📊 Rate Limiting

### Limites Atuais
- **Autenticação**: 5 tentativas por minuto por IP
- **APIs gerais**: 100 requests por minuto por usuário
- **Upload de arquivos**: 10 requests por minuto por usuário

### Headers de Rate Limit
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🚀 Exemplos de Integração

### JavaScript/Fetch
```javascript
const api = {
  baseURL: 'http://localhost:3001',
  token: localStorage.getItem('token'),

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  },

  // Vendas
  async getVendas(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/venda?${query}`);
  },

  async createVenda(data) {
    return this.request('/venda', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Uso
try {
  const vendas = await api.getVendas({ idImobiliaria: 1 });
  console.log(vendas);
} catch (error) {
  console.error('Erro:', error.message);
}
```

### TypeScript/Axios
```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

class ImobiGestAPI {
  private client: AxiosInstance;

  constructor(baseURL: string, token?: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    // Interceptador de resposta para tratamento de erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data);
        throw error;
      }
    );
  }

  async getVendas(params?: any): Promise<Venda[]> {
    const response = await this.client.get('/venda', { params });
    return response.data.data;
  }

  async createVenda(data: VendaData): Promise<Venda> {
    const response = await this.client.post('/venda', data);
    return response.data;
  }
}

// Uso
const api = new ImobiGestAPI('http://localhost:3001', token);
const vendas = await api.getVendas({ idImobiliaria: 1 });
```

## 📝 Changelog da API

### v1.0.0 (Atual)
- Implementação inicial da API REST
- Autenticação JWT
- CRUD completo para todas as entidades
- Sistema de busca e filtros
- Relatórios básicos

### Próximas Versões
- **v1.1.0**: WebSocket para atualizações em tempo real
- **v1.2.0**: Upload de arquivos e documentos
- **v1.3.0**: Notificações por email
- **v2.0.0**: GraphQL como alternativa ao REST