import { useState } from 'react'
import TablaPacientes from './components/TablaPacientes'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TablaPacientes />
    </>
  )
}

export default App
