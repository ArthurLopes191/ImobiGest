'use client';

import React from 'react';

interface ModalMessagesProps {
    error: string;
    success: string;
}

export default function ModalMessages({ error, success }: ModalMessagesProps) {
    if (!error && !success) return null;

    return (
        <>
            {/* Mensagens de erro */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Mensagens de sucesso */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
                    <p className="text-green-600 text-sm">{success}</p>
                </div>
            )}
        </>
    );
}