import './App.css';
import React from 'react'
import {BrowserRouter as Router} from "react-router-dom"
import { AuthProvider } from './context/AuthContext'
import Navbar from './views/navbar';
import Routes from './routes/Routes'; 


function App() {
  return (
    <Router>
      <AuthProvider>
        < Navbar/>
        <Routes/>
      </AuthProvider>
    </Router>
  )
}

export default App