import { useState, useEffect, useRef, useCallback, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Input } from '@/components/Input/Input.tsx';
import { SectionOnPage } from '@/components/SectionOnPage/SectionOnPage';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

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

export const DepositOne: FC = () => {
  const { depositId } = useParams();
  const navigate = useNavigate();
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [operations, setOperations] = useState<DepositOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPortfolioValue, setCurrentPortfolioValue] = useState<number>(0);
  const [editingOperationId, setEditingOperationId] = useState<string | null>(
    null
  );
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const { data } = await axios.get(`/admin_get_deposit_one/${depositId}`);
        if (data.status === 'success') {
          setDeposit(data.data);
          setOperations(data.operations || []);
          setCurrentPortfolioValue(
            data.currentPortfolioValue || data.data.amountInEur
          );
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
      year: 'numeric',
    });
  };

  const handleSaveOperationProfit = useCallback(
    async (operationId: string, profitValue: string) => {
      const profitNum = Number(profitValue);
      if (isNaN(profitNum)) return;

      try {
        const { data } = await axios.put(
          `/admin_update_deposit_operation/${operationId}`,
          {
            profit_percent: profitNum,
          }
        );
        if (data.status === 'success') {
          setOperations((prev) =>
            prev.map((op) => (op._id === operationId ? data.data : op))
          );
          // Обновляем текущую стоимость портфеля
          setCurrentPortfolioValue(data.data.week_finish_amount);
        }
      } catch (error) {
        console.error('Ошибка при сохранении операции:', error);
      }
    },
    []
  );

  const handleOperationInputChange = useCallback(
    (operationId: string, value: string) => {
      // Запоминаем ID редактируемой операции
      setEditingOperationId(operationId);

      // Очищаем предыдущий таймер для этой операции
      if (debounceTimers.current[operationId]) {
        clearTimeout(debounceTimers.current[operationId]);
      }

      // Устанавливаем новый таймер с задержкой 500мс
      debounceTimers.current[operationId] = setTimeout(() => {
        handleSaveOperationProfit(operationId, value);
      }, 500);
    },
    [handleSaveOperationProfit]
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

  if (!deposit) {
    return (
      <Page back={true}>
        <div style={{ padding: '0 16px' }}>
          <Text text="Депозит не найден" />
        </div>
        <AdminTabbarMenu />
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100 }}>
        <Header2 title="Детали портфеля" />
        <div
          style={{
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <SectionOnPage>
            <Text hometext={`Telegram ID: ${deposit.user.tlgid}`} />
            <Text
              hometext={`Валюта: ${
                deposit.valute === 'crypto' ? 'Криптовалюта' : 'Наличные'
              }`}
            />
            <Text hometext={`Валюта платежа: ${deposit.cryptoCashCurrency}`} />
            <Text
              hometext={`Сумма: ${deposit.amount} ${deposit.cryptoCashCurrency}`}
            />
            <Text hometext={`Срок: ${deposit.period} мес`} />
            <Text hometext={`Риск: ${deposit.riskPercent}%`} />
            <Text
              hometext={`Статус: ${deposit.isActive ? 'Активен' : 'Завершён'}`}
            />
            <Text
              hometext={`Дата создания: ${formatDate(deposit.createdAt)}`}
            />
            <Text
              hometext={`Дата окончания: ${formatDate(deposit.date_until)}`}
            />
          </SectionOnPage>

          <SectionOnPage>
            <Text
              hometext={`Цена портфеля начальная: € ${deposit.amountInEur}`}
            />
            <Text
              hometext={`Цена портфеля текущая: € ${currentPortfolioValue}`}
            />
            <Text
              hometext={`Прибыль по портфелю: ${
                currentPortfolioValue - deposit.amountInEur >= 0 ? '+' : ''
              }${
                deposit.amountInEur > 0
                  ? (
                      ((currentPortfolioValue - deposit.amountInEur) /
                        deposit.amountInEur) *
                      100
                    ).toFixed(2)
                  : 0
              }%`}
            />
            <Text
              hometext={`Прибыль по портфелю: ${
                currentPortfolioValue - deposit.amountInEur >= 0 ? '€ +' : '€'
              } ${(currentPortfolioValue - deposit.amountInEur).toFixed(2)}`}
            />
          </SectionOnPage>

          <SectionOnPage>
            {/* <Text text="История операций по неделям" /> */}
            {operations.length > 0 ? (
              operations.map((op, index) => {
                const startDate = new Date(
                  op.week_date_start
                ).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                });
                const endDate = new Date(
                  op.week_date_finish
                ).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                });
                const profitEur = (
                  (op.week_start_amount * op.profit_percent) /
                  100
                ).toFixed(2);
                const profitColor =
                  op.profit_percent >= 0 ? '#4ade80' : '#ef4444';
                const profitSign = op.profit_percent >= 0 ? '+' : '';
                const isLastOperation = index === operations.length - 1;
                const isBeingEdited = op._id === editingOperationId;
                const showInput =
                  isLastOperation && (!op.isFilled || isBeingEdited);
                return (
                  <div key={op._id} style={{ marginBottom: '12px' }}>
                    <Text
                      hometext={`Неделя ${op.number_of_week} (${startDate}-${endDate}):`}
                    />
                    {!showInput ? (
                      <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                        € {op.week_start_amount} →{' '}
                        <span style={{ color: profitColor }}>
                          {profitSign}
                          {op.profit_percent}%
                        </span>{' '}
                        (€ {profitEur}) → € {op.week_finish_amount}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Text hometext={`€ ${op.week_start_amount} → `} />
                        {/* <div style={{ width: '65px', flexShrink: 0 }}>
                          <Input
                            type="number"
                            placeholder="%"
                            defaultValue={op.profit_percent || ''}
                            onChange={(e) =>
                              handleOperationInputChange(op._id, e.target.value)
                            }
                          />
                        </div> */}
                        <div style={{ width: '65px', flexShrink: 0 }}>
                          <Input
                            type="number"
                            placeholder="%"
                            defaultValue={op.profit_percent || ''}
                            style={{ padding: '5px' }}
                            onChange={(e) =>
                              handleOperationInputChange(op._id, e.target.value)
                            }
                          />
                        </div>
                        <Text
                          hometext={`% (€ ${profitEur}) → € ${op.week_finish_amount} `}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <Text hometext="Нет операций" />
            )}
          </SectionOnPage>

          <Button onClick={() => navigate('/usersall')}>Назад</Button>
        </div>
      </div>
      <AdminTabbarMenu />
    </Page>
  );
};
