'use client';

import React from 'react';
import { VendaData, ImobiliariaVenda, FormaPagamento } from '@/types/venda';

interface VendaFormProps {
    formData: VendaData;
    imobiliarias: ImobiliariaVenda[];
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function VendaForm({ formData, imobiliarias, onInputChange }: VendaFormProps) {
    return (
        <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Dados da Venda</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="descricaoImovel" className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição do Imóvel
                    </label>
                    <textarea
                        id="descricaoImovel"
                        name="descricaoImovel"
                        value={formData.descricaoImovel}
                        onChange={onInputChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: COND das Hortencias casa 03"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="valorTotal" className="block text-sm font-medium text-gray-700 mb-2">
                            Valor Total (R$)
                        </label>
                        <input
                            type="number"
                            id="valorTotal"
                            name="valorTotal"
                            value={formData.valorTotal === 0 ? '' : formData.valorTotal}
                            onChange={onInputChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1350000.00"
                        />
                    </div>

                    <div>
                        <label htmlFor="dataVenda" className="block text-sm font-medium text-gray-700 mb-2">
                            Data da Venda
                        </label>
                        <input
                            type="datetime-local"
                            id="dataVenda"
                            name="dataVenda"
                            value={formData.dataVenda}
                            onChange={onInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700 mb-2">
                            Forma de Pagamento
                        </label>
                        <select
                            id="formaPagamento"
                            name="formaPagamento"
                            value={formData.formaPagamento}
                            onChange={onInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="A_VISTA">À Vista</option>
                            <option value="PARCELADO">Parcelado</option>
                        </select>
                    </div>

                    {formData.formaPagamento === 'PARCELADO' && (
                        <div>
                            <label htmlFor="qtdParcelas" className="block text-sm font-medium text-gray-700 mb-2">
                                Quantidade de Parcelas
                            </label>
                            <input
                                type="number"
                                id="qtdParcelas"
                                name="qtdParcelas"
                                value={formData.qtdParcelas === 0 ? '' : formData.qtdParcelas}
                                onChange={onInputChange}
                                required={formData.formaPagamento === 'PARCELADO'}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="12"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="compradorNome" className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Comprador
                        </label>
                        <input
                            type="text"
                            id="compradorNome"
                            name="compradorNome"
                            value={formData.compradorNome}
                            onChange={onInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nome do comprador"
                        />
                    </div>

                    <div>
                        <label htmlFor="compradorContato" className="block text-sm font-medium text-gray-700 mb-2">
                            Contato do Comprador
                        </label>
                        <input
                            type="text"
                            id="compradorContato"
                            name="compradorContato"
                            value={formData.compradorContato}
                            onChange={onInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="vendedorNome" className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Vendedor
                        </label>
                        <input
                            type="text"
                            id="vendedorNome"
                            name="vendedorNome"
                            value={formData.vendedorNome}
                            onChange={onInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nome do vendedor"
                        />
                    </div>

                    <div>
                        <label htmlFor="vendedorContato" className="block text-sm font-medium text-gray-700 mb-2">
                            Contato do Vendedor
                        </label>
                        <input
                            type="text"
                            id="vendedorContato"
                            name="vendedorContato"
                            value={formData.vendedorContato}
                            onChange={onInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="comissaoComprador" className="block text-sm font-medium text-gray-700 mb-2">
                            Comissão do Comprador (%)
                        </label>
                        <input
                            type="number"
                            id="comissaoComprador"
                            name="comissaoComprador"
                            value={formData.comissaoComprador === 0 ? '' : formData.comissaoComprador}
                            onChange={onInputChange}
                            required
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="3.00"
                        />
                    </div>

                    <div>
                        <label htmlFor="comissaoVendedor" className="block text-sm font-medium text-gray-700 mb-2">
                            Comissão do Vendedor (%)
                        </label>
                        <input
                            type="number"
                            id="comissaoVendedor"
                            name="comissaoVendedor"
                            value={formData.comissaoVendedor === 0 ? '' : formData.comissaoVendedor}
                            onChange={onInputChange}
                            required
                            min="0"
                            max="100"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="3.00"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="comissaoImobiliaria" className="block text-sm font-medium text-gray-700 mb-2">
                            Comissão Total da Imobiliária (%)
                        </label>
                        <input
                            type="number"
                            id="comissaoImobiliaria"
                            name="comissaoImobiliaria"
                            value={formData.comissaoImobiliaria}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                            placeholder="Calculado automaticamente"
                        />
                        <p className="text-xs text-gray-500 mt-1">Soma das comissões do comprador e vendedor</p>
                    </div>

                    <div>
                        <label htmlFor="valorComissaoImobiliaria" className="block text-sm font-medium text-gray-700 mb-2">
                            Valor da Comissão (R$)
                        </label>
                        <input
                            type="number"
                            id="valorComissaoImobiliaria"
                            name="valorComissaoImobiliaria"
                            value={formData.valorComissaoImobiliaria.toFixed(2)}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                            placeholder="Calculado automaticamente"
                        />
                        <p className="text-xs text-gray-500 mt-1">Calculado automaticamente com base na porcentagem e valor total</p>
                    </div>
                </div>

                <div>
                    <label htmlFor="idImobiliaria" className="block text-sm font-medium text-gray-700 mb-2">
                        Imobiliária
                    </label>
                    <select
                        id="idImobiliaria"
                        name="idImobiliaria"
                        value={formData.idImobiliaria || ''}
                        onChange={onInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Selecione uma imobiliária</option>
                        {imobiliarias.map((imobiliaria) => (
                            <option key={imobiliaria.id} value={imobiliaria.id}>
                                {imobiliaria.nome}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}