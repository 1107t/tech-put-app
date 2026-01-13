import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/admins/LoginPage';

function App() {
  const handleLogin = async (data: any) => {
    console.log('ログイン情報:', data);
    // ここにログイン処理を書く
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <AdminLogin 
              onSubmit={handleLogin}
              errorMessages={[]}
            />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;