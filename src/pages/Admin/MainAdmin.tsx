import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

export const MainAdminPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Page back={false}>
      <div style={{ marginBottom: 100}}>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Header2 title="Админ панель" />

       <Button onClick={() => navigate('/usersall')}>
                      Пользователи
            </Button>   
       <Button onClick={() => navigate('/depositrqstall')}>
                      Заявки на создание портфеля
            </Button>   
       <Button onClick={() => navigate('/changepasswordall')}>
                      Заявки на восстановление пароля
        </Button>   
       <Button onClick={() => navigate('/cryptorates')}>
                      Курс крипты
        </Button>   
            </div>

</div>
      <AdminTabbarMenu />
    </Page>
  );
};
