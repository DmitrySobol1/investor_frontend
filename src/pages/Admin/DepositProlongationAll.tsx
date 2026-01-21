import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

interface DepositProlongation {
  _id: string;
  user: {
    _id: string;
    tlgid: string;
    name: string;
    username?: string;
  };
  linkToDeposit: {
    _id: string;
    amountInEur: number;
  };
  actionToProlong: 'get_all_sum' | 'get_part_sum' | 'reinvest_all';
  valute: string | null;
  cryptoCashCurrency: string | null;
  amount: number | null;
  isOperated: boolean;
  createdAt: string;
}

// const ACTION_LABELS: Record<string, string> = {
//   get_all_sum: 'Вывести всё',
//   get_part_sum: 'Частичный вывод',
//   reinvest_all: 'Реинвестировать'
// };

export const DepositProlongationAll: FC = () => {
  const navigate = useNavigate();
  const [prolongations, setProlongations] = useState<DepositProlongation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProlongations = async () => {
      try {
        const { data } = await axios.get('/admin_get_deposit_prolongation');
        if (data.status === 'success') {
          setProlongations(data.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке заявок:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProlongations();
  }, []);

  const formatButtonText = (item: DepositProlongation) => {
    const userName = item.user.name || item.user.username || item.user.tlgid;
    // const action = ACTION_LABELS[item.actionToProlong] || item.actionToProlong;

    // if (item.actionToProlong === 'get_part_sum' && item.amount) {
    //   return `${userName} - ${action}: ${item.amount} ${item.cryptoCashCurrency || ''}`;
    // }

    return `${userName}`;
  };

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
      <div style={{ marginBottom: 100 }}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Header2 title="Заявки на продление/выплату" />

          {prolongations.map((item) => (
            <Button
              key={item._id}
              onClick={() => navigate(`/depositprolongationone/${item._id}`)}
            >
              {formatButtonText(item)}
            </Button>
          ))}

          {prolongations.length === 0 && (
            <p style={{ color: '#9ca3af', textAlign: 'center' }}>
              Нет заявок на продление/выплату
            </p>
          )}
        </div>
      </div>
      <AdminTabbarMenu />
    </Page>
  );
};
