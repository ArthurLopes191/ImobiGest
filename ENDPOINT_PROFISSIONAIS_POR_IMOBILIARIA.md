# Endpoint: Buscar Profissionais por Imobiliária

## Endpoint Sugerido
```
GET /profissional/imobiliaria/{idImobiliaria}
```

## Exemplo de implementação no backend
```typescript
// Controller
async getProfissionaisByImobiliaria(idImobiliaria: number) {
    return await this.profissionalService.findByImobiliaria(idImobiliaria);
}

// Service
async findByImobiliaria(idImobiliaria: number) {
    return await this.profissionalRepository.find({
        where: { idImobiliaria },
        relations: ['imobiliaria', 'cargos']
    });
}
```

## Modificação no hook useComissao.ts
```typescript
const fetchProfissionaisPorImobiliaria = async (idImobiliaria: number) => {
    setIsLoadingProfissionais(true);
    try {
        const token = getCookieValue('token');
        if (!token) return;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/profissional/imobiliaria/${idImobiliaria}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (response.ok) {
            const data = await response.json();
            setProfissionaisFiltrados(data);
        }
    } catch (err) {
        console.error('Erro ao carregar profissionais da imobiliária:', err);
    } finally {
        setIsLoadingProfissionais(false);
    }
};

// useEffect modificado
useEffect(() => {
    if (idImobiliaria) {
        fetchProfissionaisPorImobiliaria(idImobiliaria);
    } else {
        setProfissionaisFiltrados([]);
        setComissaoData(prev => ({ ...prev, idProfissional: 0, idsCargos: [] }));
    }
}, [idImobiliaria]);
```

## Vantagens do endpoint específico:
1. **Performance**: Menos dados trafegados
2. **Escalabilidade**: Melhor para muitos profissionais
3. **Simplicidade**: Lógica no backend, frontend mais simples
4. **Consistência**: Sempre dados atualizados

## Desvantagens:
1. **Mais requests**: Uma request extra por mudança de imobiliária
2. **Complexidade**: Precisa implementar no backend