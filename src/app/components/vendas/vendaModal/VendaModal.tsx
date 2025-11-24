'use client';

import { useState } from 'react';
import { VendaModalProps } from '@/types/venda';
import { useVendaForm } from './useVendaForm';
import { useComissao } from './useComissao';
import { useParcelas } from './useParcelas';
import VendaForm from './VendaForm';
import ComissaoForm from './ComissaoForm';
import ParcelaManager from './ParcelaManager';
import ModalActions from './ModalActions';
import ModalMessages from './ModalMessages';

export default function VendaModal({
    showModal,
    onClose,
    onSuccess,
    venda,
    mode,
    imobiliarias
}: VendaModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { formData, handleInputChange, resetForm } = useVendaForm({ 
        mode, 
        venda, 
        showModal 
    });

    const {
        comissaoData,
        profissionais,
        isLoadingProfissionais,
        handleProfissionalAdd,
        handleProfissionalRemove,
        resetComissaoData,
        criarComissao,
        atualizarComissao
    } = useComissao({ 
        showModal, 
        mode, 
        vendaId: venda?.id,
        idImobiliaria: formData.idImobiliaria
    });

    const {
        parcelas,
        isLoading: isLoadingParcelas,
        error: errorParcelas,
        criarParcelas,
        atualizarTodasParcelas,
        atualizarParcelaLocal,
        resetParcelas,
        gerarParcelasAutomaticas
    } = useParcelas({
        vendaId: venda?.id,
        valorTotal: formData.valorTotal,
        qtdParcelas: formData.qtdParcelas,
        dataVenda: formData.dataVenda,
        formaPagamento: formData.formaPagamento,
        mode
    });

    const getCookieValue = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    const handleClose = () => {
        resetForm();
        resetComissaoData();
        resetParcelas();
        setError('');
        setSuccess('');
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getCookieValue('token');
            if (!token) {
                setError('Token de autenticação não encontrado');
                return;
            }

            // Validações para criação
            if (mode === 'create') {
                if (!comissaoData.profissionais || comissaoData.profissionais.length === 0) {
                    setError('Selecione pelo menos um profissional para a comissão');
                    return;
                }
            }

            // Preparar dados para envio
            const dataParaEnvio = {
                ...formData,
                dataVenda: new Date(formData.dataVenda).toISOString()
            };

            const url = mode === 'create'
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/venda`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/venda/${venda?.id}`;

            const method = mode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataParaEnvio)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} venda`);
            }

            const vendaResponse = await response.json();

            // Gerenciar comissão e parcelas
            if (mode === 'create' && vendaResponse.id) {
                await criarComissao(vendaResponse.id);
                if (formData.formaPagamento === 'PARCELADO') {
                    await criarParcelas(vendaResponse.id);
                }
            } else if (mode === 'edit' && venda?.id) {
                if (comissaoData.profissionais && comissaoData.profissionais.length > 0) {
                    await atualizarComissao(venda.id);
                }
                if (formData.formaPagamento === 'PARCELADO') {
                    await atualizarTodasParcelas();
                }
            }

            const successMessage = mode === 'create'
                ? formData.formaPagamento === 'PARCELADO'
                    ? 'Venda, comissões e parcelas criadas com sucesso!'
                    : 'Venda e comissões criadas com sucesso!'
                : formData.formaPagamento === 'PARCELADO' && comissaoData.profissionais.length > 0
                    ? 'Venda, comissões e parcelas atualizadas com sucesso!'
                    : comissaoData.profissionais.length > 0 
                        ? 'Venda e comissões atualizadas com sucesso!'
                        : formData.formaPagamento === 'PARCELADO'
                            ? 'Venda e parcelas atualizadas com sucesso!'
                            : 'Venda atualizada com sucesso!';
            setSuccess(successMessage);

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!venda?.id) return;

        const confirmDelete = window.confirm('Tem certeza que deseja deletar esta venda?');
        if (!confirmDelete) return;

        setIsDeleting(true);
        setError('');
        setSuccess('');

        try {
            const token = getCookieValue('token');
            if (!token) {
                setError('Token de autenticação não encontrado');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/venda/${venda.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao deletar venda');
            }

            setSuccess('Venda deletada com sucesso!');

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!showModal) return null;

    const modalTitle = mode === 'create' ? 'Nova Venda' : 'Editar Venda';

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <VendaForm
                                formData={formData}
                                imobiliarias={imobiliarias}
                                onInputChange={handleInputChange}
                            />

                            <ComissaoForm
                                comissaoData={comissaoData}
                                profissionais={profissionais}
                                isLoadingProfissionais={isLoadingProfissionais}
                                mode={mode}
                                onProfissionalAdd={handleProfissionalAdd}
                                onProfissionalRemove={handleProfissionalRemove}
                                idImobiliaria={formData.idImobiliaria}
                            />

                            <ParcelaManager
                                parcelas={parcelas}
                                formaPagamento={formData.formaPagamento}
                                isLoading={isLoadingParcelas}
                                mode={mode}
                                onParcelaChange={atualizarParcelaLocal}
                                onRegenerarParcelas={gerarParcelasAutomaticas}
                            />
                        </div>

                        <ModalActions
                            mode={mode}
                            isLoading={isLoading}
                            isDeleting={isDeleting}
                            onClose={handleClose}
                            onDelete={handleDelete}
                        />
                    </form>

                    <ModalMessages error={error} success={success} />
                </div>
            </div>
        </div>
    );
}