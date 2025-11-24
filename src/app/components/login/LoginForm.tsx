'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

// Schema de validação com Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [loginError, setLoginError] = useState<string>('');
  const router = useRouter();
  const { login, state } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setLoginError('');
    
    try {
      await login(data.email, data.password);
      router.push('/home');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Erro ao fazer login');
    }
  };

  return (
    <div className="relative flex h-screen w-screen items-center justify-center">
      
      <Image
        src="/background-login.jpeg" 
        alt="Background de Login"
        fill
        style={{ objectFit: 'cover' }}
        quality={100}
        priority 
        className="absolute inset-0 z-0"
      />

      <div 
        className="
          relative z-10 
          p-8 md:p-12 
          bg-white/30 
          backdrop-blur-lg 
          rounded-xl 
          shadow-2xl 
          border border-white/40
          w-11/12 max-w-sm
          flex flex-col items-center
        "
      >

        <div className="mb-8 w-48 h-48 rounded-full bg-white p-4 flex items-center justify-center shadow-lg">
          <Image 
            src="/imobigest-logo.png"
            alt="Logo ImobiGest"
            width={120}
            height={120}
            className="object-contain"
          />
        </div>

        {/* Erro de login */}
        {loginError && (
          <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
            <p className="text-red-200 text-sm text-center">{loginError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              {...register('email')}
              className={`
                w-full px-4 py-3 rounded-lg border-none 
                focus:ring-2 transition duration-150 ease-in-out 
                placeholder-gray-500 bg-white/90
                ${errors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
              `}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-200 bg-red-500/20 px-2 py-1 rounded">
                {errors.email.message}
              </p>
            )}
          </div>
          
          <div>
            <input 
              type="password" 
              placeholder="Senha" 
              {...register('password')}
              className={`
                w-full px-4 py-3 rounded-lg border-none 
                focus:ring-2 transition duration-150 ease-in-out 
                placeholder-gray-500 bg-white/90
                ${errors.password ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
              `}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-200 bg-red-500/20 px-2 py-1 rounded">
                {errors.password.message}
              </p>
            )}
          </div>

          <button 
            type="submit"
            disabled={state.isLoading}
            className={`
              w-full py-3 mt-6 text-center font-semibold rounded-lg 
              transition duration-200 shadow-md
              ${state.isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'text-gray-800 bg-white hover:bg-gray-100'
              }
            `}
          >
            {state.isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="#" className="text-white/80 text-sm hover:text-white transition">
            Esqueceu a senha?
          </a>
        </div>
      </div>
    </div>
  );
}