import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ErrorMessage {
  id: number;
  message: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState<ErrorMessage[]>([]);

  const handleSubmit = async (data: LoginFormData) => {
    try {
      // 管理者ログインAPIを呼び出す
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          remember_me: data.rememberMe,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // エラーメッセージをIDと共にセット
        const errors: ErrorMessage[] = errorData.errors.map((msg: string, index: number) => ({
          id: Date.now() + index,
          message: msg
        }));
        
        setErrorMessages(errors);
        return;
      }

      const result = await response.json();
      
      // ログイン成功時の処理
      console.log('ログイン成功:', result);
      
      // 管理画面のダッシュボードにリダイレクト
      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessages([
        { id: Date.now(), message: 'ネットワークエラーが発生しました。もう一度お試しください。' }
      ]);
    }
  };

  return (
    <LoginPage
      onSubmit={handleSubmit}
      errorMessages={errorMessages}
      title="Nature Technology"
      subtitle="管理者ログイン画面"
      showSocialLogin={false}
      showRememberMe={true}
    />
  );
};

export default AdminLogin;