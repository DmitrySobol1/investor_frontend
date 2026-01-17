import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { SectionOnPage } from '@/components/SectionOnPage/SectionOnPage';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

interface Deposit {
  _id: string;
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
  exchangeRate: number;
}

interface DepositOperation {
  _id: string;
  week_date_start: string;
  week_date_finish: string;
  week_start_amount: number;
  week_finish_amount: number;
  number_of_week: number;
  profit_percent: number;
  isFilled: boolean;
}

export const DetailedDepositPage: FC = () => {
  const { depositId } = useParams();
  const navigate = useNavigate();
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [operations, setOperations] = useState<DepositOperation[]>([]);
  const [currentPortfolioValue, setCurrentPortfolioValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const { data } = await axios.get(`/get_deposit_one/${depositId}`);
        if (data.status === 'success') {
          setDeposit(data.data);
          setOperations(data.operations || []);
          setCurrentPortfolioValue(
            data.currentPortfolioValue || data.data.amountInEur
          );
        }
      } catch (error) {
        console.error('Error loading deposit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeposit();
  }, [depositId]);

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
          <Text text="Портфель не найден" />
        </div>
      </Page>
    );
  }

  const profitPercent = deposit.amountInEur > 0
    ? ((currentPortfolioValue - deposit.amountInEur) / deposit.amountInEur) * 100
    : 0;
  const profitEur = currentPortfolioValue - deposit.amountInEur;

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100 }}>
        <Header2 title="Информация по портфелю" />
        <div
          style={{
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <SectionOnPage>
            <Text hometext={`Цена портфеля начальная: € ${deposit.amountInEur?.toFixed(2)}`} />
            <Text hometext={`Цена портфеля текущая: € ${currentPortfolioValue?.toFixed(2)}`} />
            <Text hometext={`Прибыль по портфелю: ${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}%`} />
            <Text hometext={`Прибыль по портфелю: ${profitEur >= 0 ? '€ +' : '€'} ${profitEur.toFixed(2)}`} />
          </SectionOnPage>

          <SectionOnPage>
            {operations.length > 0 ? (
              operations.map((op) => {
                const startDate = new Date(op.week_date_start).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                });
                const endDate = new Date(op.week_date_finish).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                });
                const profitEurWeek = ((op.week_start_amount * op.profit_percent) / 100).toFixed(2);
                const profitColor = op.profit_percent >= 0 ? '#4ade80' : '#ef4444';
                const profitSign = op.profit_percent >= 0 ? '+' : '';

                return (
                  <div key={op._id} style={{ marginBottom: '12px' }}>
                    <Text hometext={`Неделя ${op.number_of_week} (${startDate}-${endDate}):`} />
                    <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                      € {op.week_start_amount} →{' '}
                      <span style={{ color: profitColor }}>
                        {profitSign}{op.profit_percent}%
                      </span>{' '}
                      (€ {profitEurWeek}) → € {op.week_finish_amount}
                    </div>
                  </div>
                );
              })
            ) : (
              <Text hometext="Нет данных по неделям" />
            )}
          </SectionOnPage>

          <Button onClick={() => navigate('/index')}>Назад</Button>
        </div>
      </div>
      <TabbarMenu />
    </Page>
  );
};
