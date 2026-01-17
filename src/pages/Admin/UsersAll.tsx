import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Card } from '@/components/Card/Card.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { CardList } from '@/components/CardList/CardList.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

interface Deposit {
  _id: string;
  valute: string;
  cryptoCashCurrency: string;
  amount: number;
  period: number;
  riskPercent: number;
  isActive: boolean;
  date_until: string;
  createdAt: string;
  amountInEur: number;
  profitPercent: number;
  exchangeRate: number;
}

interface User {
  _id: string;
  tlgid: number;
  jbid?: number;
  name?: string;
  isSetPassword: boolean;
  createdAt: string;
  deposits: Deposit[];
}

export const UsersAll: FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/admin_get_all_users');
        if (data.status === 'success') {
          setUsers(data.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Page back={false}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <CircularProgress sx={{ color: '#4ade80' }} />
        </div>
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100}}>
      {/* <Header title="Easy dev" subtitle="про разработку для «не кодеров»" /> */}
      <Header2 title="Пользователи" />

      {users.length === 0 ? (
        <div style={{ padding: '0 16px' }}>
          <Text text="Нет пользователей" />
        </div>
      ) : (
        <CardList>
          {users.map((user) => {
            const formatDate = (dateStr: string) => {
              const date = new Date(dateStr);
              return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                // hour: '2-digit',
                // minute: '2-digit'
              });
            };

            return (
              <Card
                key={user._id}
                title={user.name || 'Без имени'}
                subtitle={`tlg: ${user.tlgid}`}
                // badge={{
                //   isShown: true,
                //   text: user.isSetPassword ? 'Пароль установлен' : 'Без пароля',
                //   color: user.isSetPassword ? '#4ade80' : '#9ca3af',
                // }}
                isAccordion={true}
                accordionContent={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
                    {/* <div>Telegram ID: {user.tlgid}</div> */}
                    {/* {user.jbid && <div>JB ID: {user.jbid}</div>} */}
                    {/* {user.name && <div>Имя: {user.name}</div>} */}
                    {/* <div>Пароль: {user.isSetPassword ? 'Установлен' : 'Не установлен'}</div> */}
                    {/* <div>Дата регистрации: {formatDate(user.createdAt)}</div> */}
                    {user.deposits.length == 0 && 'Нет активных портфелей' }
                    {user.deposits && user.deposits.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ marginBottom: '8px' }}>Активные портфели:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {user.deposits.map((deposit) => (
                            <Button
                              key={deposit._id}
                              onClick={() => navigate(`/depositone/${deposit._id}`)}
                            >
                              {deposit.amount} {deposit.cryptoCashCurrency} | до: {formatDate(deposit.date_until)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                }
              />
            );
          })}
        </CardList>
      )}


     
</div>
      <AdminTabbarMenu />
    </Page>
  );
};
