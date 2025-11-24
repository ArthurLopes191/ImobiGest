# Sistema de Parcelas para Vendas

## Visão Geral

O sistema de parcelas foi implementado para gerenciar pagamentos parcelados nas vendas do ImobiGest. Ele inclui:

1. **Geração automática de parcelas** baseada nos dados da venda
2. **Gerenciamento completo de parcelas** (criar, editar, deletar)
3. **Exibição de informações** na listagem de vendas
4. **Interface responsiva** para desktop e mobile

## Componentes Criados

### 1. Hook useParcelas (`useParcelas.ts`)
- Gerencia o estado e lógica das parcelas
- Gera parcelas automaticamente baseado no valor total e quantidade
- Integra com todos os endpoints da API de parcelas
- Suporta modos de criação e edição

### 2. ParcelaManager (`ParcelaManager.tsx`)
- Componente principal para edição de parcelas no modal de venda
- Interface completa para editar valor, data de vencimento e status
- Layout responsivo com tabela para desktop e cards para mobile
- Resumo visual do status das parcelas

### 3. ParcelaInfo (`ParcelaInfo.tsx`)
- Componente compacto para exibir informações na listagem
- Mostra progresso das parcelas (pagas/total)
- Indica status (pendentes, atrasadas, todas pagas)
- Cores diferenciadas por status

## Endpoints Utilizados

- `POST /parcela` - Criar nova parcela
- `PUT /parcela/{id}` - Editar parcela existente  
- `DELETE /parcela/{id}` - Deletar parcela
- `GET /parcela` - Listar todas as parcelas
- `GET /parcela/{id}` - Buscar parcela específica
- `GET /parcela/venda/{id}` - Buscar parcelas de uma venda

## Fluxo de Funcionamento

### Criação de Venda
1. Usuário preenche dados da venda
2. Se forma de pagamento = "PARCELADO", parcelas são geradas automaticamente
3. Usuário pode ajustar valores e datas das parcelas
4. Ao salvar a venda, parcelas são criadas na API

### Edição de Venda
1. Sistema carrega parcelas existentes da venda
2. Usuário pode modificar parcelas existentes
3. Botão "Regenerar Parcelas" recria todas as parcelas baseado nos dados atuais
4. Ao salvar, parcelas antigas são deletadas e novas são criadas

### Listagem de Vendas
- Nova coluna "Parcelas" mostra progresso e status
- Cards móveis incluem informações das parcelas
- Atualização automática ao carregar a página

## Estrutura dos Dados

```typescript
interface Parcela {
  id?: number;
  numeroParcela: number;
  valorParcela: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  idVenda: number;
}
```

## Características Principais

### Geração Automática
- Divide o valor total pela quantidade de parcelas
- Ajusta a última parcela para compensar arredondamentos
- Define vencimentos mensais a partir da data da venda
- Status inicial sempre "PENDENTE"

### Interface Intuitiva
- Edição inline de valores e datas
- Seleção de status por dropdown
- Resumo visual com contadores
- Responsividade total

### Integração Completa
- Funciona junto com sistema de comissões
- Mensagens de sucesso contextuais
- Tratamento de erros robusto
- Sincronização automática

## Como Usar

1. **Criar venda com parcelas:**
   - Selecione "Parcelado" na forma de pagamento
   - Defina a quantidade de parcelas
   - Ajuste valores/datas se necessário
   - Salve a venda

2. **Editar parcelas existentes:**
   - Abra uma venda parcelada para edição
   - Modifique valores, datas ou status das parcelas
   - Use "Regenerar Parcelas" para recalcular automaticamente
   - Salve as alterações

3. **Visualizar status:**
   - Na listagem, veja o progresso na coluna "Parcelas"
   - Cores indicam status: verde (pagas), amarelo (pendentes), vermelho (atrasadas)

O sistema está totalmente integrado e pronto para uso!