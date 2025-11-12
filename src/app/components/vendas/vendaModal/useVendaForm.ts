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
            if (name === 'valorTotal') {
                setFormData(prev => ({
                    ...prev,
                    [name]: value === '' ? 0 : parseFloat(value) || 0
                }));
            } else if (name === 'idImobiliaria' || name === 'qtdParcelas') {
                setFormData(prev => ({
                    ...prev,
                    [name]: value === '' ? 0 : parseInt(value) || 0
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
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