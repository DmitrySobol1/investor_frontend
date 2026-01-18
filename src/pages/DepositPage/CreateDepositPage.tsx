import { useState, useEffect, type FC, useContext } from 'react';
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
import { SectionOnPage } from '@/components/SectionOnPage/SectionOnPage.tsx';

import { LanguageContext } from '../../components/App.tsx';
import { TEXTS } from './texts';

interface CryptoRate {
  name: string;
  value: number;
}

export const CreateDepositPage: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { headerT, yourNameT, yourNamePlaceholderT, selectCurrencyT, cashT, cryptoT,
          investmentAmountT, enterAmountT, minDepositT, investmentPeriodT, monthsT,
          riskPercentT, doneT, fillAllFieldsT, errorT } = TEXTS[language];
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
  const [cryptoRates, setCryptoRates] = useState<Record<string, number>>({});
  const [showMinDepositError, setShowMinDepositError] = useState(false);

  const MIN_DEPOSIT_EUR = 10000;

  // Загрузка курсов при монтировании компонента
  useEffect(() => {
    const fetchCryptoRates = async () => {
      try {
        const { data } = await axios.get('/get_crypto_rates');
        if (data.status === 'success') {
          const ratesMap: Record<string, number> = {};
          data.data.forEach((rate: CryptoRate) => {
            ratesMap[rate.name] = rate.value;
          });
          setCryptoRates(ratesMap);
        }
      } catch (err) {
        console.error('Ошибка при загрузке курсов:', err);
      }
    };

    fetchCryptoRates();
  }, []);

  // Функция для расчета суммы в EUR
  const getAmountInEUR = (): number => {
    const numAmount = Number(amount);
    if (!numAmount) return 0;

    if (cryptoCashCurrency === 'EUR') {
      return numAmount;
    }

    const rate = cryptoRates[cryptoCashCurrency];
    if (!rate) return 0;

    return numAmount * rate;
  };

  // Проверка минимальной суммы
  const isMinDepositValid = (): boolean => {
    if (!amount) return true; // Не показываем ошибку для пустого поля
    return getAmountInEUR() >= MIN_DEPOSIT_EUR;
  };

  // Проверка заполненности формы
  const isFormValid = amount.length > 0 && (!isFirstEnter || username.length > 0) && isMinDepositValid();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем пустое значение, положительные числа с точкой или запятой
    // Регулярное выражение: необязательные цифры, опциональная точка/запятая, необязательные цифры
    const isValidNumber = value === '' || /^[0-9]*[.,]?[0-9]*$/.test(value);

    if (isValidNumber && !value.startsWith('-')) {
      setAmount(value);
      // Проверяем минимальную сумму при изменении
      if (value && value !== '.' && value !== ',') {
        // Заменяем запятую на точку для правильного парсинга
        const normalizedValue = value.replace(',', '.');
        const tempAmount = Number(normalizedValue);
        if (!isNaN(tempAmount)) {
          let amountInEUR = tempAmount;
          if (cryptoCashCurrency !== 'EUR' && cryptoRates[cryptoCashCurrency]) {
            amountInEUR = tempAmount * cryptoRates[cryptoCashCurrency];
          }
          setShowMinDepositError(amountInEUR < MIN_DEPOSIT_EUR);
        }
      } else {
        setShowMinDepositError(false);
      }
    }
  };

  const handleCreateDeposit = async () => {
    try {
      setLoading(true);
      setErrorText('');

      // Нормализуем сумму: заменяем запятую на точку перед отправкой
      const normalizedAmount = amount.replace(',', '.');

      const response = await axios.post('/create_deposit_request', {
        tlgid,
        valute,
        cryptoCashCurrency,
        amount: Number(normalizedAmount),
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
        setErrorText(errorT);
      }
    } catch (err) {
      console.error('Ошибка при создании депозита:', err);
      setError(true);
      setErrorText(errorT);
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
      <Header2 title={headerT} />

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}>

        {isFirstEnter === true && (
          <>

            <SectionOnPage>

            <Text text={yourNameT} />
            <Input
              type="text"
              placeholder={yourNamePlaceholderT}
              value={username}
              onChange={(e) => setUserName(e.target.value)}
            />
          </SectionOnPage>
            </> 
        )}


        <SectionOnPage>
        <Text text={selectCurrencyT} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant={valute === 'cash' ? 'filled' : 'outline'}
            onClick={() => { setValute('cash'); setCryptoCashCurrency('EUR'); }}
          >
            {cashT}
          </Button>
          <Button
            variant={valute === 'crypto' ? 'filled' : 'outline'}
            onClick={() => { setValute('crypto'); setCryptoCashCurrency('USDT'); }}
          >
            {cryptoT}
          </Button>
        </div>  
        </SectionOnPage>    


        <SectionOnPage>
        <Text text={investmentAmountT} />

        <Input
          type="number"
          placeholder={`${enterAmountT}, ${cryptoCashCurrency}`}
          value={amount}
          onChange={handleAmountChange}
          min="0"
        />
        {showMinDepositError && (
          <p style={{ color: '#ef4444', margin: 0, marginTop: '8px', fontSize: '14px' }}>
            {cryptoCashCurrency === 'EUR'
              ? `${minDepositT} 10000 EUR`
              : (() => {
                  if (!cryptoRates[cryptoCashCurrency]) return `${minDepositT} ... ${cryptoCashCurrency} (10000 EUR)`;

                  const minAmount = MIN_DEPOSIT_EUR / cryptoRates[cryptoCashCurrency];
                  let formattedAmount: string;

                  if (cryptoCashCurrency === 'BTC') {
                    formattedAmount = minAmount.toFixed(4);
                  } else if (cryptoCashCurrency === 'ETH') {
                    formattedAmount = minAmount.toFixed(3);
                  } else {
                    formattedAmount = Math.ceil(minAmount).toString();
                  }

                  return `${minDepositT} ${formattedAmount} ${cryptoCashCurrency} (10000 EUR)`;
                })()
            }
          </p>
        )}
        {valute === 'crypto' && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
            <Button
              variant={cryptoCashCurrency === 'USDT' ? 'filled' : 'outline'}
                onClick={() => {
                  setCryptoCashCurrency('USDT');
                  // Пересчитываем валидацию при смене валюты
                  if (amount) {
                    const amountInEUR = Number(amount) * (cryptoRates['USDT'] || 0);
                    setShowMinDepositError(amountInEUR < MIN_DEPOSIT_EUR);
                  }
                }}
              >
              USDT
            </Button>
            <Button
              variant={cryptoCashCurrency === 'BTC' ? 'filled' : 'outline'}
              onClick={() => {
                setCryptoCashCurrency('BTC');
                // Пересчитываем валидацию при смене валюты
                if (amount) {
                  const amountInEUR = Number(amount) * (cryptoRates['BTC'] || 0);
                  setShowMinDepositError(amountInEUR < MIN_DEPOSIT_EUR);
                }
              }}
            >
              BTC
            </Button>
            <Button
              variant={cryptoCashCurrency === 'ETH' ? 'filled' : 'outline'}
              onClick={() => {
                setCryptoCashCurrency('ETH');
                // Пересчитываем валидацию при смене валюты
                if (amount) {
                  const amountInEUR = Number(amount) * (cryptoRates['ETH'] || 0);
                  setShowMinDepositError(amountInEUR < MIN_DEPOSIT_EUR);
                }
              }}
            >
              ETH
            </Button>
          </div>
        )}
        </SectionOnPage>


        <SectionOnPage>
        <Text text={investmentPeriodT} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant={period === 12 ? 'filled' : 'outline'}
            onClick={() => setPeriod(12)}
          >
            {`12 ${monthsT}`}
          </Button>
          <Button
            variant={period === 24 ? 'filled' : 'outline'}
            onClick={() => setPeriod(24)}
          >
            {`24 ${monthsT}`}
          </Button>
          <Button
            variant={period === 36 ? 'filled' : 'outline'}
            onClick={() => setPeriod(36)}
          >
            {`36 ${monthsT}`}
          </Button>
        </div>
        </SectionOnPage>


        <SectionOnPage>  
        <Text text={riskPercentT} />
        <Slider value={riskPercent} onChange={setRiskPercent} />
        </SectionOnPage>

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
              {doneT}
            </Button>
          </div>
        </div>
        {showValidationError && !isFormValid && (
          <p style={{ color: '#ef4444', margin: 0, textAlign: 'center', marginTop:'15px' }}>
            {fillAllFieldsT}
          </p>
        )}
        {error && (
          <p style={{ color: '#ef4444', margin: 0, textAlign: 'center', marginTop:'15px' }}>
            {errorText}
          </p>
        )}
      </div>
</div>
<TabbarMenu />
    </Page>
  );
};
