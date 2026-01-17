import { useState, useEffect, useRef, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Input } from '@/components/Input/Input.tsx';
import { SectionOnPage } from '@/components/SectionOnPage/SectionOnPage';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

interface CryptoRate {
  _id: string;
  name: string;
  value: number;
}

export const CryptoRatesPage: FC = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState<CryptoRate[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const { data } = await axios.get('/get_crypto_rates');
        if (data.status === 'success') {
          setRates(data.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке курсов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const handleSaveRate = useCallback(
    async (rateId: string, name: string, newValue: string) => {
      // Нормализуем: заменяем запятую на точку
      const normalizedValue = newValue.replace(',', '.');
      const valueNum = Number(normalizedValue);

      if (isNaN(valueNum)) return;

      try {
        const { data } = await axios.post('/update_crypto_rate', {
          name,
          value: valueNum,
        });

        if (data.status === 'success') {
          setRates((prev) =>
            prev.map((rate) => (rate._id === rateId ? data.data : rate))
          );
        }
      } catch (error) {
        console.error('Ошибка при сохранении курса:', error);
      }
    },
    []
  );

  const handleRateInputChange = useCallback(
    (rateId: string, name: string, value: string) => {
      if (debounceTimers.current[rateId]) {
        clearTimeout(debounceTimers.current[rateId]);
      }

      debounceTimers.current[rateId] = setTimeout(() => {
        handleSaveRate(rateId, name, value);
      }, 500);
    },
    [handleSaveRate]
  );

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
        <Header2 title="Курсы криптовалют" />
        <div
          style={{
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <SectionOnPage>
            {rates.length > 0 ? (
              rates
                .filter((rate) => rate.name !== 'EUR')
                .map((rate) => {
                  return (
                    <div key={rate._id} style={{ marginBottom: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Text hometext={`1 ${rate.name} =`} />
                        <div style={{ width: '100px', flexShrink: 0 }}>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="курс"
                            defaultValue={rate.value || ''}
                            style={{ padding: '5px' }}
                            onChange={(e) =>
                              handleRateInputChange(rate._id, rate.name, e.target.value)
                            }
                          />
                        </div>
                        <Text hometext="EUR" />
                      </div>
                    </div>
                  );
                })
            ) : (
              <Text hometext="Нет курсов" />
            )}
          </SectionOnPage>

          <Button onClick={() => navigate('/mainadmin')}>Назад</Button>
        </div>
      </div>
      <AdminTabbarMenu />
    </Page>
  );
};
