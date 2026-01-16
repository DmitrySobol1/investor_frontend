import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
// import { Header } from '@/components/Header/Header.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';


import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';



export const MainStatPage: FC = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);



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
    <Page back={false}>
      <div style={{ marginBottom: 100}}>
      <Header2 title="Статистика" />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

       

       <Button onClick={() => navigate('/btcstat_page')}>
                      Статистика Биткоина
            </Button>   
       <Button onClick={() => navigate('/depositstat_page')}>
                      Статистика портфелей
            </Button>   
        
            </div>

</div>
      <TabbarMenu />
    </Page>
  );
};
