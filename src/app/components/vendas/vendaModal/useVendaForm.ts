'use client';

import { useState, useEffect } from 'react';
import { VendaData, FormaPagamento, Venda } from '@/types/venda';

interface UseVendaFormProps {
    mode: 'create' | 'edit';
    venda?: Venda | null;
    showModal: boolean;
}

export function useVendaForm({ mode, venda, showModal }: UseVendaFormProps) {
    const [formData, setFormData] = useState<VendaData>({
        descricaoImovel: '',
        valorTotal: 0,
        dataVenda: '',
        formaPagamento: 'A_VISTA',
        qtdParcelas: 0,
        compradorNome: '',
        compradorContato: '',
        vendedorNome: '',
        vendedorContato: '',
        comissaoComprador: 0,
        comissaoVendedor: 0,
        comissaoImobiliaria: 0,
        valorComissaoImobiliaria: 0,
        idImobiliaria: 0
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'formaPagamento') {
            setFormData(prev => ({
                ...prev,
                [name]: value as FormaPagamento,
                qtdParcelas: value === 'A_VISTA' ? 0 : prev.qtdParcelas
            }));
        } else {
            setFormData(prev => {
                let newFormData = { ...prev };
                
                if (name === 'valorTotal') {
                    newFormData.valorTotal = value === '' ? 0 : parseFloat(value) || 0;
                } else if (name === 'idImobiliaria' || name === 'qtdParcelas') {
                    (newFormData as any)[name] = value === '' ? 0 : parseInt(value) || 0;
                } else if (name === 'comissaoComprador' || name === 'comissaoVendedor') {
                    (newFormData as any)[name] = value === '' ? 0 : parseFloat(value) || 0;
                } else {
                    (newFormData as any)[name] = value;
                }

                // Calcular comissaoImobiliaria automaticamente
                if (name === 'comissaoComprador' || name === 'comissaoVendedor') {
                    const comissaoComprador = name === 'comissaoComprador' ? (value === '' ? 0 : parseFloat(value) || 0) : newFormData.comissaoComprador;
                    const comissaoVendedor = name === 'comissaoVendedor' ? (value === '' ? 0 : parseFloat(value) || 0) : newFormData.comissaoVendedor;
                    newFormData.comissaoImobiliaria = comissaoComprador + comissaoVendedor;
                    newFormData.valorComissaoImobiliaria = (newFormData.comissaoImobiliaria / 100) * newFormData.valorTotal;
                }

                // Recalcular valorComissaoImobiliaria quando valorTotal muda
                if (name === 'valorTotal') {
                    const valorTotal = value === '' ? 0 : parseFloat(value) || 0;
                    newFormData.valorComissaoImobiliaria = (newFormData.comissaoImobiliaria / 100) * valorTotal;
                }

                return newFormData;
            });
        }
    };

    const resetForm = () => {
        const agora = new Date();
        const dataAtual = agora.toISOString().slice(0, 16);

        setFormData({
            descricaoImovel: '',
            valorTotal: 0,
            dataVenda: dataAtual,
            formaPagamento: 'A_VISTA',
            qtdParcelas: 0,
            compradorNome: '',
            compradorContato: '',
            vendedorNome: '',
            vendedorContato: '',
            comissaoComprador: 0,
            comissaoVendedor: 0,
            comissaoImobiliaria: 0,
            valorComissaoImobiliaria: 0,
            idImobiliaria: 0
        });
    };

    // Preencher formulário quando modal abre/venda é selecionada
    useEffect(() => {
        if (mode === 'edit' && venda && showModal) {
            const dataVenda = new Date(venda.dataVenda);
            const dataFormatada = dataVenda.toISOString().slice(0, 16);
            
            setFormData({
                descricaoImovel: venda.descricaoImovel,
                valorTotal: venda.valorTotal,
                dataVenda: dataFormatada,
                formaPagamento: venda.formaPagamento,
                qtdParcelas: venda.qtdParcelas,
                compradorNome: venda.compradorNome,
                compradorContato: venda.compradorContato,
                vendedorNome: venda.vendedorNome || '',
                vendedorContato: venda.vendedorContato || '',
                comissaoComprador: venda.comissaoComprador || 0,
                comissaoVendedor: venda.comissaoVendedor || 0,
                comissaoImobiliaria: venda.comissaoImobiliaria || 0,
                valorComissaoImobiliaria: venda.valorComissaoImobiliaria || 0,
                idImobiliaria: venda.idImobiliaria
            });
        } else if (mode === 'create' && showModal) {
            const agora = new Date();
            const dataAtual = agora.toISOString().slice(0, 16);
            
            setFormData(prev => ({
                ...prev,
                dataVenda: dataAtual
            }));
        }
    }, [mode, venda, showModal]);

    return {
        formData,
        handleInputChange,
        resetForm
    };
}