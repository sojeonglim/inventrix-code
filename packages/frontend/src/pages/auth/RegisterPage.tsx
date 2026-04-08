import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterForm } from '@/lib/validators'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Link, useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const { register: authRegister } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authRegister(data.email, data.password, data.name)
      navigate('/')
    } catch { addToast('error', '회원가입에 실패했습니다') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-purple-600 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">✨ Create Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="register-form">
          <div>
            <input {...register('name')} placeholder="Name" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <input {...register('email')} type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input {...register('password')} type="password" placeholder="Password (8자+, 대소문자+숫자+특수문자)" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} data-testid="register-form-submit-button"
            className="w-full py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 font-medium">
            {isSubmitting ? '가입 중...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          이미 계정이 있으신가요? <Link to="/login" className="text-brand-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
