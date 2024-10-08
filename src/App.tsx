import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Editor from './components/Editor'
import Editor2 from './components/Editor2'

function App() {

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Image Presets</h1>
      <Editor2 />
    </>
  )
}

export default App
