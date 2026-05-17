import { Navigate } from 'react-router-dom'

/** @deprecated Use /project/system-design-lab */
export function DesignSystemPage() {
  return <Navigate to="/project/system-design-lab" replace />
}
