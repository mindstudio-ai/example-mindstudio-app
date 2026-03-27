import { createRoot } from 'react-dom/client';
import { Route, Switch } from 'wouter';
import App from './App.tsx';
import Chat from './Chat.tsx';
import './global.css';

createRoot(document.getElementById('root')!).render(
  <Switch>
    <Route path="/chat" component={Chat} />
    <Route component={App} />
  </Switch>,
);
