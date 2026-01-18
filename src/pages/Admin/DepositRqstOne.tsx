import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Input } from '@/components/Input/Input.tsx';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

interface DepositRequest {
  _id: string;
  user: {
    _id: string;
    tlgid: string;
    name: string;
    username? : string;
  };
  valute: string;
  cryptoCashCurrency: string;
  amount: number;
  period: number;
  riskPercent: number;
  isOperated: boolean;
}

interface CryptoRate {
  name: string;
  value: number;
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
    const fetchData = async () => {
      try {
        // Загружаем курсы и заявку параллельно
        const [ratesResponse, requestResponse] = await Promise.all([
          axios.get('/get_crypto_rates'),
          axios.get(`/admin_get_deposit_rqst_one/${requestId}`)
        ]);

        // Обрабатываем курсы
        const ratesMap: Record<string, number> = {};
        if (ratesResponse.data.status === 'success') {
          ratesResponse.data.data.forEach((rate: CryptoRate) => {
            ratesMap[rate.name] = rate.value;
          });
        }

        // Обрабатываем заявку
        if (requestResponse.data.status === 'success') {
          const request = requestResponse.data.data;
          setDepositRequest(request);

          // Автоматически заполняем exchangeRate из курсов
          if (request && request.cryptoCashCurrency) {
            if (request.cryptoCashCurrency === 'EUR') {
              setExchangeRate('1');
            } else if (ratesMap[request.cryptoCashCurrency]) {
              setExchangeRate(ratesMap[request.cryptoCashCurrency].toString());
            }
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <AdminTabbarMenu />
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100 }}>
          <Header2 title="Детали заявки" />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Text hometext={`Имя: ${depositRequest.user.name}`} />
          <Text hometext={`Telegram ID: ${depositRequest.user.tlgid}`} />
          <Text hometext={`Username: ${depositRequest.user.username ? `@${depositRequest.user.username}` : 'нет'}`} />
          
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
              style={{ width: '100px' }}
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
      <AdminTabbarMenu />
    </Page>
  );
};
