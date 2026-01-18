import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

interface DepositRequest {
  _id: string;
  user: {
    _id: string;
    tlgid: string;
    name :string
  };
  valute: string;
  cryptoCashCurrency: string;
  amount: number;
  period: number;
  riskPercent: number;
  isOperated: boolean;
}

export const DepositRqstAll: FC = () => {
  const navigate = useNavigate();
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepositRequests = async () => {
      try {
        const { data } = await axios.get('/admin_get_deposit_rqst');
        if (data.status === 'success') {
          setDepositRequests(data.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке заявок:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepositRequests();
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
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Header2 title="Заявки на депозит" />

      {depositRequests.map((request) => (
        <Button key={request._id} onClick={() => navigate(`/depositrqstone/${request._id}`)}>
          {request.user.name}
        </Button>
      ))}

      {depositRequests.length === 0 && (
        <p style={{ color: '#9ca3af', textAlign: 'center' }}>Нет заявок на депозит</p>
      )}
            </div>

</div>
      <AdminTabbarMenu />
    </Page>
  );
};
