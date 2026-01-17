import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu';

export const AdminEnterPage: FC = () => {
  const navigate = useNavigate();

  return (
    <Page back={false}>
      <div style={{ marginBottom: 100}}>
      <Header2 title="Админ панель" />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <Text text= {'зайти как'}></Text>

       <Button onClick={() => navigate('/mainadmin')}>
                      Админ
            </Button>   
       <Button onClick={() => navigate('/index')}>
                      Пользователь
            </Button>   
          
            </div>

</div>
      {/* <TabbarMenu /> */}
      <AdminTabbarMenu />
    </Page>
  );
};
