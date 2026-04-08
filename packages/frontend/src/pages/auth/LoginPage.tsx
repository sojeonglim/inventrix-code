import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextInput, Button, Stack, Tile, InlineLoading, Link as CarbonLink } from '@carbon/react'
import { loginSchema, type LoginForm } from '@/lib/validators'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Link, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    try { await login(data.email, data.password); navigate('/') }
    catch { addToast('error', '로그인 실패') }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--cds-background)' }}>
      <Tile style={{ width: 400, padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>✨ Inventrix Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} data-testid="login-form">
          <Stack gap={5}>
            <TextInput id="email" labelText="Email" type="email" {...register('email')} invalid={!!errors.email} invalidText={errors.email?.message} />
            <TextInput id="password" labelText="Password" type="password" {...register('password')} invalid={!!errors.password} invalidText={errors.password?.message} />
            <Button type="submit" disabled={isSubmitting} data-testid="login-form-submit-button" style={{ width: '100%' }}>
              {isSubmitting ? <InlineLoading description="로그인 중..." /> : 'Login'}
            </Button>
          </Stack>
        </form>
        <p style={{ marginTop: '1rem', fontSize: 14, textAlign: 'center' }}>
          계정이 없으신가요? <CarbonLink as={Link} to="/register">Register</CarbonLink>
        </p>
      </Tile>
    </div>
  )
}
