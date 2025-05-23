import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MSALRoot from './MSALRoot';


createRoot(document.getElementById('root')).render(
  <StrictMode>
        


    <MSALRoot />
  </StrictMode>,
)
