# Endpoint de Busca de Vendas com Filtros

## Endpoint Principal
```
GET /venda/search
```

## Parâmetros de Query (todos opcionais)

### Filtros de Venda
- `descricao` (string): Busca parcial na descrição do imóvel
- `valorMin` (number): Valor mínimo da venda
- `valorMax` (number): Valor máximo da venda
- `dataInicio` (string): Data inicial no formato YYYY-MM-DD
- `dataFim` (string): Data final no formato YYYY-MM-DD
- `formaPagamento` (string): "A_VISTA" ou "PARCELADO"
- `idImobiliaria` (number): ID da imobiliária
- `idProfissional` (number): ID do vendedor/profissional
- `nomeComprador` (string): Busca parcial no nome do comprador

### Filtros de Parcelas (apenas para vendas parceladas)
- `statusParcela` (string): "PENDENTE", "PAGA" ou "ATRASADA"

### Paginação
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)

### Ordenação
- `sortBy` (string): Campo para ordenação ("dataVenda", "valorTotal", "descricaoImovel")
- `sortOrder` (string): Direção da ordenação ("ASC" ou "DESC")

## Exemplo de URL
```
/venda/search?descricao=casa&valorMin=100000&valorMax=500000&formaPagamento=PARCELADO&idImobiliaria=1&page=1&limit=10&sortBy=dataVenda&sortOrder=DESC
```

## Estrutura da Resposta

```json
{
  "vendas": [
    {
      "id": "1",
      "descricaoImovel": "Casa no COND das Hortências",
      "valorTotal": 350000.00,
      "dataVenda": "2024-11-15T14:30:00.000Z",
      "formaPagamento": "PARCELADO",
      "qtdParcelas": 12,
      "compradorNome": "João Silva",
      "compradorContato": "(11) 99999-9999",
      "idImobiliaria": 1,
      "imobiliaria": {
        "nome": "Imobiliária XYZ"
      },
      "comissoes": [
        {
          "id": 1,
          "idProfissional": 1,
          "profissional": {
            "nome": "Maria Santos"
          }
        }
      ],
      "parcelas": [
        {
          "id": 1,
          "numero": 1,
          "valor": 29166.67,
          "dataVencimento": "2024-12-15",
          "status": "PENDENTE"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

## Implementação SQL Sugerida

### Query Base (exemplo em SQL genérico)
```sql
SELECT 
  v.*,
  i.nome as imobiliaria_nome,
  c.id as comissao_id,
  c.idProfissional,
  p.nome as profissional_nome,
  pc.id as parcela_id,
  pc.numero as parcela_numero,
  pc.valor as parcela_valor,
  pc.dataVencimento as parcela_vencimento,
  pc.status as parcela_status
FROM venda v
LEFT JOIN imobiliaria i ON v.idImobiliaria = i.id
LEFT JOIN comissao c ON v.id = c.idVenda
LEFT JOIN profissional p ON c.idProfissional = p.id
LEFT JOIN parcela pc ON v.id = pc.idVenda
WHERE 1=1
  -- Filtros dinâmicos
  AND ($descricao IS NULL OR v.descricaoImovel ILIKE '%' || $descricao || '%')
  AND ($valorMin IS NULL OR v.valorTotal >= $valorMin)
  AND ($valorMax IS NULL OR v.valorTotal <= $valorMax)
  AND ($dataInicio IS NULL OR DATE(v.dataVenda) >= $dataInicio)
  AND ($dataFim IS NULL OR DATE(v.dataVenda) <= $dataFim)
  AND ($formaPagamento IS NULL OR v.formaPagamento = $formaPagamento)
  AND ($idImobiliaria IS NULL OR v.idImobiliaria = $idImobiliaria)
  AND ($idProfissional IS NULL OR c.idProfissional = $idProfissional)
  AND ($nomeComprador IS NULL OR v.compradorNome ILIKE '%' || $nomeComprador || '%')
  AND ($statusParcela IS NULL OR pc.status = $statusParcela)
ORDER BY 
  CASE WHEN $sortBy = 'dataVenda' THEN v.dataVenda END,
  CASE WHEN $sortBy = 'valorTotal' THEN v.valorTotal END,
  CASE WHEN $sortBy = 'descricaoImovel' THEN v.descricaoImovel END
  -- Aplicar $sortOrder (ASC/DESC)
LIMIT $limit OFFSET ($page - 1) * $limit;
```

### Query para Total (para paginação)
```sql
SELECT COUNT(DISTINCT v.id) as total
FROM venda v
LEFT JOIN comissao c ON v.id = c.idVenda
LEFT JOIN parcela pc ON v.id = pc.idVenda
WHERE 1=1
  -- Mesmos filtros da query principal
  AND ($descricao IS NULL OR v.descricaoImovel ILIKE '%' || $descricao || '%')
  -- ... outros filtros
```

## Índices Recomendados para Performance

```sql
-- Índices para campos frequentemente filtrados
CREATE INDEX idx_venda_descricao ON venda USING gin(to_tsvector('portuguese', descricaoImovel));
CREATE INDEX idx_venda_valor_total ON venda(valorTotal);
CREATE INDEX idx_venda_data_venda ON venda(dataVenda);
CREATE INDEX idx_venda_forma_pagamento ON venda(formaPagamento);
CREATE INDEX idx_venda_imobiliaria ON venda(idImobiliaria);
CREATE INDEX idx_venda_comprador_nome ON venda USING gin(to_tsvector('portuguese', compradorNome));

-- Índices para JOINs
CREATE INDEX idx_comissao_venda ON comissao(idVenda);
CREATE INDEX idx_comissao_profissional ON comissao(idProfissional);
CREATE INDEX idx_parcela_venda ON parcela(idVenda);
CREATE INDEX idx_parcela_status ON parcela(status);
```

## Validações no Backend

1. **Validar tipos de dados**: Garantir que números são números, datas são válidas
2. **Validar ranges**: valorMin <= valorMax, dataInicio <= dataFim
3. **Validar enums**: formaPagamento, statusParcela, sortBy, sortOrder
4. **Limitar paginação**: limit máximo de 100
5. **Sanitizar strings**: Prevenir SQL injection

## Exemplo de Implementação (Node.js/Express)

```javascript
app.get('/venda/search', async (req, res) => {
  try {
    const {
      descricao,
      valorMin,
      valorMax,
      dataInicio,
      dataFim,
      formaPagamento,
      idImobiliaria,
      idProfissional,
      statusParcela,
      nomeComprador,
      page = 1,
      limit = 10,
      sortBy = 'dataVenda',
      sortOrder = 'DESC'
    } = req.query;

    // Validações
    const validatedPage = Math.max(1, parseInt(page));
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit)));
    
    // Construir filtros
    const filters = {};
    if (descricao) filters.descricao = descricao;
    if (valorMin) filters.valorMin = parseFloat(valorMin);
    if (valorMax) filters.valorMax = parseFloat(valorMax);
    // ... outros filtros

    // Executar busca
    const result = await vendaService.searchWithFilters({
      filters,
      pagination: { page: validatedPage, limit: validatedLimit },
      sorting: { sortBy, sortOrder }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

## Benefícios desta Abordagem

1. **Performance**: Filtros executados no banco de dados
2. **Escalabilidade**: Paginação eficiente mesmo com milhares de registros
3. **Flexibilidade**: Combinação de múltiplos filtros
4. **UX**: Busca rápida e responsiva
5. **Manutenibilidade**: Lógica centralizada no backend