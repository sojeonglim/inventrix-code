import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error) { console.error('ErrorBoundary caught:', error) }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">문제가 발생했습니다</h2>
          <button
            data-testid="error-boundary-home-button"
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >홈으로 돌아가기</button>
        </div>
      )
    }
    return this.props.children
  }
}
