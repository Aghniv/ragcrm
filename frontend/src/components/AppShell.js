import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * Berry-style app shell: fixed dark sidebar + sticky white topbar + main
 * content area. Wraps the protected routes in App.js.
 */
function AppShell({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <Topbar />
      <div className="app-body" style={{ marginLeft: 0 }}>
        <main className="app-content" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
