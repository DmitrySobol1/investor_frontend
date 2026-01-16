import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { useTlgid } from '@/components/Tlgid.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

interface Deposit {
  _id: string;
  amountInEur: number;
  profitPercent: number;
  isActive: boolean;
}

export const DepositStatPage: FC = () => {
  const navigate = useNavigate();
  const { tlgid } = useTlgid();
  const [loading, setLoading] = useState(true);
  const [totalInvested, setTotalInvested] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);

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

            // Считаем текущую стоимость портфелей
            const current = activeDeposits.reduce((sum, d) => {
              const profit = (d.amountInEur || 0) * (d.profitPercent || 0) / 100;
              return sum + (d.amountInEur || 0) + profit;
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
      <div style={{ marginBottom: 100 }}>
        <Header2 title="Статистика портфелей" />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Text text={`Всего инвестировано: € ${totalInvested.toFixed(2)}`} />
          <Text text={`Текущая цена портфелей: € ${currentValue.toFixed(2)}`} />
          <Text text={`Прибыль по всем портфелям: € ${(currentValue - totalInvested).toFixed(2)}`} />
          <Text text={`Прибыль по всем портфелям: ${totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested * 100).toFixed(2) : '0.00'} %`} />

          <Button onClick={() => navigate('/mainstat_page')}>
            назад
          </Button>
        </div>
      </div>
      <TabbarMenu />
    </Page>
  );
};
