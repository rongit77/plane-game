import React from 'react';
import ReactDOM from 'react-dom/client';
import PlaneGame from './PlaneGame';
import './index.css';

const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <PlaneGame />
  </React.StrictMode>
);


