import { useState, useEffect, type FC, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { LanguageContext } from '../../components/App.tsx';
import { TEXTS } from './texts';

export const DepositRqstDone: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { requestAcceptedT, waitConfirmT, sendToAddressT, toAddressT, goToAccountT } = TEXTS[language];
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

      <div style={{ padding: '40px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text text={requestAcceptedT} />
      <Text text={waitConfirmT} />

      {valute === 'crypto' && (
        <Text text={`${sendToAddressT} ${amount} ${cryptoCashCurrency} ${toAddressT}: ${adress}`} />
      )}

      <Button onClick={() => navigate('/index')}>
                {goToAccountT}
      </Button>  

       </div>       
        
      
</div>
      <TabbarMenu />
    </Page>
  );
};
