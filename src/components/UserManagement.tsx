import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
  last_login: string | null;
}

interface LoginLog {
  id: number;
  email: string;
  login_time: string;
  ip_address: string;
  success: boolean;
  failure_reason: string | null;
}

interface UserManagementProps {
  sessionToken: string;
}

const UserManagement = ({ sessionToken }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/c651d6b3-f910-4eb3-b30d-6aa63ac75d21?action=list',
        {
          headers: { Authorization: `Bearer ${sessionToken}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (userId?: number) => {
    setLoading(true);
    try {
      const url = userId
        ? `https://functions.poehali.dev/c651d6b3-f910-4eb3-b30d-6aa63ac75d21?action=logs&user_id=${userId}`
        : 'https://functions.poehali.dev/c651d6b3-f910-4eb3-b30d-6aa63ac75d21?action=logs';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await response.json();
      if (response.ok) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Ошибка загрузки логов:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/c651d6b3-f910-4eb3-b30d-6aa63ac75d21', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        alert('Пользователь создан!');
        setShowAddUser(false);
        setNewUser({ email: '', password: '', full_name: '', role: 'user' });
        loadUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка создания');
      }
    } catch (error) {
      alert('Ошибка соединения');
    }
  };

  const handleBlockUser = async (userId: number, block: boolean) => {
    try {
      const response = await fetch('https://functions.poehali.dev/c651d6b3-f910-4eb3-b30d-6aa63ac75d21', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          user_id: userId,
          action: block ? 'block' : 'unblock',
        }),
      });

      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      alert('Ошибка');
    }
  };

  const handleChangePassword = async (userId: number) => {
    const newPassword = prompt('Введите новый пароль (минимум 6 символов):');
    if (!newPassword || newPassword.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/c651d6b3-f910-4eb3-b30d-6aa63ac75d21', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          user_id: userId,
          action: 'change_password',
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        alert('Пароль изменен!');
      }
    } catch (error) {
      alert('Ошибка');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить пользователя?')) return;

    try {
      const response = await fetch('https://functions.poehali.dev/c651d6b3-f910-4eb3-b30d-6aa63ac75d21', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      alert('Ошибка');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setShowAddUser(!showAddUser)} className="bg-green-600 hover:bg-green-700">
          <Icon name="UserPlus" size={20} />
          Добавить пользователя
        </Button>
        <Button
          onClick={() => {
            setShowLogs(!showLogs);
            if (!showLogs) loadLogs();
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Icon name="FileText" size={20} />
          {showLogs ? 'Скрыть логи' : 'Показать логи входа'}
        </Button>
      </div>

      {showAddUser && (
        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Новый пользователь</h3>
          <div className="space-y-3">
            <Input
              placeholder="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
            <Input
              placeholder="Пароль (минимум 6 символов)"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
            <Input
              placeholder="Полное имя"
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded text-white"
            >
              <option value="user">Пользователь</option>
              <option value="admin">Администратор</option>
            </select>
            <Button onClick={handleCreateUser} className="w-full bg-green-600 hover:bg-green-700">
              Создать
            </Button>
          </div>
        </Card>
      )}

      {showLogs && (
        <Card className="p-4 bg-slate-800/50 border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Логи входа (последние 100)</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg ${
                  log.success ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{log.email}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(log.login_time).toLocaleString('ru-RU')} • {log.ip_address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <Icon name="CheckCircle2" size={20} className="text-green-400" />
                    ) : (
                      <Icon name="XCircle" size={20} className="text-red-400" />
                    )}
                  </div>
                </div>
                {!log.success && log.failure_reason && (
                  <p className="text-xs text-red-300 mt-1">{log.failure_reason}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 bg-slate-800/50 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Пользователи ({users.length})</h3>
        {loading ? (
          <div className="flex justify-center p-8">
            <Icon name="Loader2" size={32} className="animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium">{user.full_name || user.email}</h4>
                      {user.role === 'admin' && (
                        <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded">Admin</span>
                      )}
                      {user.is_blocked && (
                        <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded">Заблокирован</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{user.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Создан: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      {user.last_login && ` • Последний вход: ${new Date(user.last_login).toLocaleString('ru-RU')}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleChangePassword(user.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Icon name="Key" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleBlockUser(user.id, !user.is_blocked)}
                      className={user.is_blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
                    >
                      <Icon name={user.is_blocked ? 'Unlock' : 'Lock'} size={16} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setShowLogs(true);
                        loadLogs(user.id);
                      }}
                      className="bg-slate-600 hover:bg-slate-700"
                    >
                      <Icon name="FileText" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManagement;
