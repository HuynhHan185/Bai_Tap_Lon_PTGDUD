import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'

import { store } from './app/store'
import { router } from './app/router'

import './styles/theme.css'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
)