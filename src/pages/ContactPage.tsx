import { Navigate } from 'react-router-dom'

/** Legacy route — contact form lives on the homepage section. */
export function ContactPage() {
  return <Navigate to="/#contact" replace />
}
