import { useState, useEffect, type FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { useTlgid } from '@/components/Tlgid.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { LanguageContext } from '../../components/App.tsx';
import { TEXTS } from './texts';

interface Deposit {
  _id: string;
  amountInEur: number;
  profitPercent: number;
  isActive: boolean;
  currentPortfolioValue: number;
}

export const DepositStatPage: FC = () => {
  const navigate = useNavigate();
  // const { tlgid } = useTlgid();
  const { language } = useContext(LanguageContext);
  const { depositStatTitleT, totalInvestedT, currentPriceT, profitAllT, backT } = TEXTS[language];
  const [loading, setLoading] = useState(true);
  const [totalInvested, setTotalInvested] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);

  const { tlgid: originalTlgid } = useTlgid();
  
  const tlgid = originalTlgid == import.meta.env.VITE_FIRST_TLGID 
  ? import.meta.env.VITE_SECOND_TLGID
  : originalTlgid;



  useEffect(() => {
    const fetchData = async () => {
      try {
        if (tlgid) {
          const response = await axios.get(`/get_user_deposits/${tlgid}`);
          if (response.data.status === 'success') {
            const deposits: Deposit[] = response.data.data;

            // Фильтруем только активные портфели
            const activeDeposits = deposits.filter((d) => d.isActive);

            // Считаем общую сумму инвестиций
            const invested = activeDeposits.reduce((sum, d) => sum + (d.amountInEur || 0), 0);
            setTotalInvested(invested);

            // Считаем текущую стоимость портфелей (из deposit_operations)
            const current = activeDeposits.reduce((sum, d) => {
              return sum + (d.currentPortfolioValue || d.amountInEur || 0);
            }, 0);
            setCurrentValue(current);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tlgid]);

  if (loading) {
    return (
      <Page back={true}>
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
      <div style={{ marginBottom: 100 }}>
        <Header2 title={depositStatTitleT} />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Text text={`${totalInvestedT}: € ${totalInvested.toFixed(2)}`} />
          <Text text={`${currentPriceT}: € ${currentValue.toFixed(2)}`} />
          <Text text={`${profitAllT}: € ${(currentValue - totalInvested).toFixed(2)}`} />
          <Text text={`${profitAllT}: ${totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested * 100).toFixed(2) : '0.00'} %`} />

          <Button onClick={() => navigate('/mainstat_page')}>
            {backT}
          </Button>
        </div>
      </div>
      <TabbarMenu />
    </Page>
  );
};
