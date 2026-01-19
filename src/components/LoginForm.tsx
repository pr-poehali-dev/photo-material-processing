import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface LoginFormProps {
  onLoginSuccess: (user: any, token: string) => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? 'login' : 'register';
      const response = await fetch(
        `https://functions.poehali.dev/3100b78e-436b-4b84-a95b-b8335e0f2fdc?action=${endpoint}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            ...(isLogin ? {} : { full_name: fullName }),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка');
        return;
      }

      if (isLogin) {
        localStorage.setItem('session_token', data.session_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.session_token);
      } else {
        setIsLogin(true);
        setError('');
        alert('Регистрация успешна! Теперь войдите в систему.');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md p-8 bg-slate-800/50 backdrop-blur border-slate-700">
        <div className="flex items-center justify-center mb-8">
          <Icon name="Shield" size={48} className="text-purple-400" />
        </div>

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {isLogin ? 'Вход в систему' : 'Регистрация'}
        </h1>
        <p className="text-center text-slate-400 mb-6">
          {isLogin ? 'Введите данные для входа' : 'Создайте новую учетную запись'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Полное имя
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иван Иванов"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Пароль
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              required
              minLength={6}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Icon name="Loader2" size={20} className="animate-spin" />
                Загрузка...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Icon name={isLogin ? 'LogIn' : 'UserPlus'} size={20} />
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;
