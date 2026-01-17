import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Input } from '@/components/Input/Input.tsx';

// import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

interface DepositRequest {
  _id: string;
  user: {
    _id: string;
    tlgid: string;
  };
  valute: string;
  cryptoCashCurrency: string;
  amount: number;
  period: number;
  riskPercent: number;
  isOperated: boolean;
}

export const DepositRqstOne: FC = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [depositRequest, setDepositRequest] = useState<DepositRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreated, setIsCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exchangeRate, setExchangeRate] = useState('');

  useEffect(() => {
    const fetchDepositRequest = async () => {
      try {
        const { data } = await axios.get(`/admin_get_deposit_rqst_one/${requestId}`);
        if (data.status === 'success') {
          setDepositRequest(data.data);
          if (data.data && data.data.cryptoCashCurrency == 'EUR'){
              setExchangeRate('1')
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке заявки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepositRequest();
  }, [requestId]);

  const handleCreateDeposit = async () => {
    if (!depositRequest || !exchangeRate) return;

    try {
      setCreating(true);
      const amountInEur = (depositRequest.amount * Number(exchangeRate)).toFixed(2);
      const { data } = await axios.post('/create_new_deposit', {
        requestId,
        exchangeRate,
        amountInEur
      });
      if (data.status === 'success') {
        setIsCreated(true);
      }
    } catch (error) {
      console.error('Ошибка при создании портфеля:', error);
    } finally {
      setCreating(false);
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

  if (!depositRequest) {
    return (
      <Page back={false}>
        <div style={{ padding: '0 16px' }}>
          <Text text="Заявка не найдена" />
        </div>
        {/* <TabbarMenu /> */}
      </Page>
    );
  }

  return (
    <Page back={false}>
      <div style={{ marginBottom: 100 }}>
          <Header2 title="Детали заявки" />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Text hometext={`Telegram ID: ${depositRequest.user.tlgid}`} />
          <Text hometext={`Валюта: ${depositRequest.valute === 'crypto' ? 'Криптовалюта' : 'Наличные'}`} />
          <Text hometext={`Валюта платежа: ${depositRequest.cryptoCashCurrency}`} />
          <Text hometext={`Сумма: ${depositRequest.amount} ${depositRequest.cryptoCashCurrency}`} />
          <Text hometext={`Срок: ${depositRequest.period} мес`} />
          <Text hometext={`Риск: ${depositRequest.riskPercent}%`} />
          <Text hometext={`----------`} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Text hometext={`Ставка 1 ${depositRequest.cryptoCashCurrency} =`} />
            <div style={{ width: 'auto' }}>
            <Input
              type="text"
              inputMode="decimal"
              style={{ width: '50px' }}
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
            </div>
            <Text hometext="EUR" />
          </div>
          <Text hometext={`Цена портфеля начальная, EUR: ${exchangeRate ? (depositRequest.amount * Number(exchangeRate)).toFixed(2) : '—'}`} />

          {isCreated ? (
            <Text text="Портфель создан" />
          ) : (
            <Button onClick={handleCreateDeposit} disabled={creating || !exchangeRate}>
              {creating ? 'Создание...' : 'Создать портфель'}
            </Button>
          )}

          <Button onClick={() => navigate('/depositrqstall')}>
            Назад
          </Button>  
        </div>

           
      </div>
      {/* <TabbarMenu /> */}
    </Page>
  );
};
