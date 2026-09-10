import { USE_MOCK_API } from '../../api/config.js'
import Alert from '../ui/Alert.jsx'

/**
 * Visible only while the app runs on the in-browser mock backend, so nobody
 * mistakes simulated queue movement for a live centre.
 */
export default function DemoNotice({ children, className = '' }) {
  if (!USE_MOCK_API) return null
  return (
    <Alert tone="info" title="Sample data" className={className}>
      {children || 'This build is not connected to a live centre yet. The figures shown are sample data.'}
    </Alert>
  )
}
