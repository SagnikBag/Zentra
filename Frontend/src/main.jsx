import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../src/app/App.jsx';
import { Provider } from 'react-redux';
import { store } from '../src/app/app.store.js';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
