import { useState, useEffect, useRef, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Input } from '@/components/Input/Input.tsx';

// import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

interface Deposit {
  _id: string;
  user: {
    _id: string;
    tlgid: string;
  };
  valute: string;
  cryptoCashCurrency: string;
  amount: number;
  period: number;
  date_until: string;
  riskPercent: number;
  isActive: boolean;
  createdAt: string;
  amountInEur: number;
  profitPercent: number;
  profitEur: number;
  exchangeRate: number;
}

export const DepositOne: FC = () => {
  const { depositId } = useParams();
  const navigate = useNavigate();
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [loading, setLoading] = useState(true);
  const [profitPercent, setProfitPercent] = useState('');
  const initialProfitPercent = useRef('');

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const { data } = await axios.get(`/admin_get_deposit_one/${depositId}`);
        if (data.status === 'success') {
          setDeposit(data.data);
          const profit = String(data.data.profitPercent || 0);
          setProfitPercent(profit);
          initialProfitPercent.current = profit;
        }
      } catch (error) {
        console.error('Ошибка при загрузке депозита:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeposit();
  }, [depositId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSaveProfitPercent = async () => {
    if (profitPercent !== initialProfitPercent.current) {
      try {
        await axios.put(`/admin_update_deposit_profit/${depositId}`, {
          profitPercent: Number(profitPercent)
        });
        initialProfitPercent.current = profitPercent;
      } catch (error) {
        console.error('Ошибка при сохранении profitPercent:', error);
      }
    }
  };

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

  if (!deposit) {
    return (
      <Page back={true}>
        <div style={{ padding: '0 16px' }}>
          <Text text="Депозит не найден" />
        </div>
        {/* <TabbarMenu /> */}
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100 }}>
          <Header2 title="Детали портфеля" />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Text text={`Telegram ID: ${deposit.user.tlgid}`} />
          <Text text={`Валюта: ${deposit.valute === 'crypto' ? 'Криптовалюта' : 'Наличные'}`} />
          <Text text={`Валюта платежа: ${deposit.cryptoCashCurrency}`} />
          <Text text={`Сумма: ${deposit.amount} ${deposit.cryptoCashCurrency}`} />
          <Text text={`Срок: ${deposit.period} мес`} />
          <Text text={`Риск: ${deposit.riskPercent}%`} />
          <Text text={`Статус: ${deposit.isActive ? 'Активен' : 'Завершён'}`} />
          <Text text={`Дата создания: ${formatDate(deposit.createdAt)}`} />
          <Text text={`Дата окончания: ${formatDate(deposit.date_until)}`} />
          <Text text={`-----`} />
          {/* <Text text={`Курс евро для начального портфеля: ${deposit.riskPercent}%`} /> */}
          <Text text={`Цена портфеля начальная, EUR: ${deposit.amountInEur}`} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text text="Прибыль по портфелю, %:" />
            <div style={{ width: 'auto' }}>
            <Input
              type="text"
              inputMode="decimal"
              style={{ width: '60px' }}
              value={profitPercent}
              onChange={(e) => setProfitPercent(e.target.value)}
              onBlur={handleSaveProfitPercent}
            />
            </div>
          </div>
          <Text text={`Прибыль по портфелю, EUR: ${(deposit.amountInEur * Number(profitPercent) / 100).toFixed(2)}`} />
          <Text text={`Цена портфеля текущая, EUR: ${(deposit.amountInEur + deposit.amountInEur * Number(profitPercent) / 100).toFixed(2)}`} />

          <Button onClick={() => navigate('/usersall')}>
            Назад
          </Button>
        </div>
      </div>
      {/* <TabbarMenu /> */}
    </Page>
  );
};
