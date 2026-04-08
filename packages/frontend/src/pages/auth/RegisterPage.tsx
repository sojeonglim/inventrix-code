import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextInput, Button, Stack, Tile, InlineLoading, Link as CarbonLink } from '@carbon/react'
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
    try { await authRegister(data.email, data.password, data.name); navigate('/') }
    catch { addToast('error', '회원가입 실패') }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--cds-background)' }}>
      <Tile style={{ width: 400, padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>✨ Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} data-testid="register-form">
          <Stack gap={5}>
            <TextInput id="name" labelText="Name" {...register('name')} invalid={!!errors.name} invalidText={errors.name?.message} />
            <TextInput id="email" labelText="Email" type="email" {...register('email')} invalid={!!errors.email} invalidText={errors.email?.message} />
            <TextInput id="password" labelText="Password" type="password" {...register('password')} invalid={!!errors.password} invalidText={errors.password?.message} helperText="8자+, 대소문자+숫자+특수문자" />
            <Button type="submit" disabled={isSubmitting} data-testid="register-form-submit-button" style={{ width: '100%' }}>
              {isSubmitting ? <InlineLoading description="가입 중..." /> : 'Register'}
            </Button>
          </Stack>
        </form>
        <p style={{ marginTop: '1rem', fontSize: 14, textAlign: 'center' }}>
          이미 계정이 있으신가요? <CarbonLink as={Link} to="/login">Login</CarbonLink>
        </p>
      </Tile>
    </div>
  )
}
