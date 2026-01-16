import { useState, type FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Input } from '@/components/Input/Input.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Slider } from '@/components/Slider/Slider.tsx';
import { useTlgid } from '@/components/Tlgid.tsx';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

export const CreateDepositPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isFirstEnter } = (location.state as { isFirstEnter?: boolean }) || {};
  const { tlgid } = useTlgid();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [username, setUserName] = useState('');
  const [valute, setValute] = useState<'cash' | 'crypto'>('cash');
  const [cryptoCashCurrency, setCryptoCashCurrency] = useState<'EUR'| 'USDT' | 'BTC' | 'ETH'>('EUR');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<12 | 24 | 36>(12);
  const [riskPercent, setRiskPercent] = useState(50);
  const [showValidationError, setShowValidationError] = useState(false);

  // Проверка заполненности формы
  const isFormValid = amount.length > 0 && (!isFirstEnter || username.length > 0);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только положительные числа
    if (value === '' || (Number(value) >= 0 && !value.startsWith('-'))) {
      setAmount(value);
    }
  };

  const handleCreateDeposit = async () => {
    try {
      setLoading(true);
      setErrorText('');

      const response = await axios.post('/create_deposit_request', {
        tlgid,
        valute,
        cryptoCashCurrency,
        amount: Number(amount),
        period,
        riskPercent,
        username,
        isFirstEnter
      });

      if (response.data.status === 'success') {
        navigate('/depositrqstdone', {
          state: { valute, amount, cryptoCashCurrency }
        });
      } else {
        setError(true);
        setErrorText('Что-то пошло не так');
      }
    } catch (err) {
      console.error('Ошибка при создании депозита:', err);
      setError(true);
      setErrorText('Что-то пошло не так');
    } finally {
      setLoading(false);
    }
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
    <Page back={false}>
      <div style={{ marginBottom: 100}}>
      <Header2 title="Создание депозита" />

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {isFirstEnter === true && (
          <>
            <Text text='Ваше имя' />
            <Input
              type="text"
              placeholder='Напишите имя'
              value={username}
              onChange={(e) => setUserName(e.target.value)}
            />
          </>
        )}

        <Text text='Выберите валюту' />
        <Button
          variant={valute === 'cash' ? 'filled' : 'outline'}
          onClick={() => { setValute('cash'); setCryptoCashCurrency('EUR'); }}
        >
          Наличные
        </Button>
        <Button
          variant={valute === 'crypto' ? 'filled' : 'outline'}
          onClick={() => { setValute('crypto'); setCryptoCashCurrency('USDT'); }}
        >
          Криптовалюта
        </Button>    

        <Text text='Сумма инвестиции' />
        
        <Input
          type="number"
          placeholder={`введите сумму, ${cryptoCashCurrency}` }
          value={amount}
          onChange={handleAmountChange}
          min="0"
        />
        {valute === 'crypto' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant={cryptoCashCurrency === 'USDT' ? 'filled' : 'outline'}
                onClick={() => setCryptoCashCurrency('USDT')}
              >
              USDT
            </Button>
            <Button
              variant={cryptoCashCurrency === 'BTC' ? 'filled' : 'outline'}
              onClick={() => setCryptoCashCurrency('BTC')}
            >
              BTC
            </Button>
            <Button
              variant={cryptoCashCurrency === 'ETH' ? 'filled' : 'outline'}
              onClick={() => setCryptoCashCurrency('ETH')}
            >
              ETH
            </Button>
          </div>
        )}

        <Text text='Срок инвестиции' />
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant={period === 12 ? 'filled' : 'outline'}
            onClick={() => setPeriod(12)}
          >
            12 мес
          </Button>
          <Button
            variant={period === 24 ? 'filled' : 'outline'}
            onClick={() => setPeriod(24)}
          >
            24 мес
          </Button>
          <Button
            variant={period === 36 ? 'filled' : 'outline'}
            onClick={() => setPeriod(36)}
          >
            36 мес
          </Button>
        </div>

        <Text text='Процент риска' />
        <Slider value={riskPercent} onChange={setRiskPercent} />

        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (!isFormValid) {
              setShowValidationError(true);
            } else {
              setShowValidationError(false);
              handleCreateDeposit();
            }
          }}
        >
          <div style={{ pointerEvents: 'none' }}>
            <Button disabled={!isFormValid}>
              Готово
            </Button>
          </div>
        </div>
        {showValidationError && !isFormValid && (
          <p style={{ color: '#ef4444', margin: 0, textAlign: 'center' }}>
            Заполните все поля
          </p>
        )}
        {error && (
          <p style={{ color: '#ef4444', margin: 0, textAlign: 'center' }}>
            {errorText}
          </p>
        )}
      </div>
</div>
<TabbarMenu />
    </Page>
  );
};
