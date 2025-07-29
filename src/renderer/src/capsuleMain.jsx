import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Capsule from './capsule'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Capsule />
  </StrictMode>
)
