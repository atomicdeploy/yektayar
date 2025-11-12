import { DefineComponent } from 'vue'
import { Solution } from '../utils/solutions'

interface ErrorScreenProps {
  title?: string
  message: string
  details?: string
  solution?: Solution | null
  errorType?: string
}

declare const ErrorScreen: DefineComponent<ErrorScreenProps>
export default ErrorScreen
