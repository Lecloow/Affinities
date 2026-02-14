import React from 'react'
import ReactDOM from 'react-dom/client'
import ProfilePage from './ProfilePage'
import "./tailwind.css";

const rootEl = document.getElementById('app')
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl)
  root.render(<ProfilePage />)
}
