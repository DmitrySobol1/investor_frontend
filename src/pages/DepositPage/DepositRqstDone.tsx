import { useState, useEffect, type FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
// import { Card } from '@/components/Card/Card.tsx';
// import { Header } from '@/components/Header/Header.tsx';
// import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';
// import { CardList } from '@/components/CardList/CardList.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';



export const DepositRqstDone: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { valute, amount, cryptoCashCurrency } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [adress, setAdress] = useState('');

  useEffect(() => {
    const fetchWalletAdress = async () => {
      if (valute === 'crypto') {
        try {
          const { data } = await axios.get(`/wallet_adress/${cryptoCashCurrency}`);
          if (data.status === 'success') {
            setAdress(data.data.adress);
          }
        } catch (error) {
          console.error('Ошибка при загрузке адреса кошелька:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWalletAdress();
  }, [valute, cryptoCashCurrency]);

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

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text text='Запрос на создание портфеля принят!' />
      <Text text='Ожидайте подтверждение от админа' />

      {valute === 'crypto' && (
        <Text text={`Отправьте ${amount} ${cryptoCashCurrency} на адрес: ${adress}`} />
      )}

      <Button onClick={() => navigate('/index')}>
                Перейти в личный кабинет
      </Button>  

       </div>       
        
      
</div>
      <TabbarMenu />
    </Page>
  );
};
