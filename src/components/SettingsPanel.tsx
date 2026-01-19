import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import UserManagement from './UserManagement';

interface SettingsPanelProps {
  onClose: () => void;
  sessionToken: string;
  currentUser: any;
}

type Tab = 'users' | 'profile' | 'system';

const SettingsPanel = ({ onClose, sessionToken, currentUser }: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const tabs = [
    { id: 'users' as Tab, label: 'Пользователи', icon: 'Users', adminOnly: true },
    { id: 'profile' as Tab, label: 'Профиль', icon: 'User' },
    { id: 'system' as Tab, label: 'Система', icon: 'Settings', adminOnly: true },
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || currentUser?.role === 'admin');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] bg-slate-900 border-slate-700 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Settings" size={28} className="text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Настройки</h2>
          </div>
          <Button onClick={onClose} size="sm" className="bg-slate-700 hover:bg-slate-600">
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-slate-800/50 border-r border-slate-700 p-4">
            <div className="space-y-2">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon name={tab.icon as any} size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'users' && currentUser?.role === 'admin' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Управление пользователями</h3>
                <UserManagement sessionToken={sessionToken} />
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Профиль пользователя</h3>
                <Card className="p-6 bg-slate-800/50 border-slate-700">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                      <p className="text-white text-lg">{currentUser?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Имя</label>
                      <p className="text-white text-lg">{currentUser?.full_name || 'Не указано'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Роль</label>
                      <p className="text-white text-lg">
                        {currentUser?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </p>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Icon name="Key" size={18} />
                      Изменить пароль
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'system' && currentUser?.role === 'admin' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Системные настройки</h3>
                <Card className="p-6 bg-slate-800/50 border-slate-700">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Логирование входов</h4>
                        <p className="text-sm text-slate-400">Записывать все попытки входа в систему</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="CheckCircle2" size={24} className="text-green-400" />
                        <span className="text-green-400 font-medium">Включено</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Хранение логов</h4>
                        <p className="text-sm text-slate-400">Последние 100 записей на пользователя</p>
                      </div>
                      <Icon name="Database" size={24} className="text-purple-400" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">Сессии</h4>
                        <p className="text-sm text-slate-400">Автоматический выход через 7 дней</p>
                      </div>
                      <Icon name="Clock" size={24} className="text-blue-400" />
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;
