import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function NotFound() {
  useDocumentTitle('Page not found')
  const { isAuthenticated } = useAuth()

  return (
    <Container className="max-w-xl py-16 text-center">
      <Icon name="alert-circle" className="mx-auto h-10 w-10 text-muted" />
      <h1 className="mt-4 text-2xl font-bold text-ink">This page does not exist</h1>
      <p className="mx-auto mt-2 text-[15px] text-muted">
        The link may be old or mistyped. Go back to a page you can use.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button to={isAuthenticated ? '/dashboard' : '/'} size="lg">
          {isAuthenticated ? 'Go to dashboard' : 'Go to the home page'}
        </Button>
        <Button to="/help" variant="secondary" size="lg">
          Help and rules
        </Button>
      </div>
    </Container>
  )
}
