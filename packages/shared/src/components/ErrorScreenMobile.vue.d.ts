import { DefineComponent } from 'vue'
import { Solution } from '../utils/solutions'

interface ErrorScreenMobileProps {
  title?: string
  message: string
  details?: string
  solution?: Solution | null
}

declare const ErrorScreenMobile: DefineComponent<ErrorScreenMobileProps>
export default ErrorScreenMobile
