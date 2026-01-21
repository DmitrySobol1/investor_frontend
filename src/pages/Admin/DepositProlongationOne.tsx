import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Card } from '@/components/Card/Card.tsx';
import { SectionOnPage } from '@/components/SectionOnPage/SectionOnPage';
import { Input } from '@/components/Input/Input.tsx';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

interface RefundHistoryItem {
  date: string;
  value: number;
}

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
    period: number;
    date_until: string;
    valute: string;
    cryptoCashCurrency: string;
    isRefunded: boolean;
    refundHistory: RefundHistoryItem[];
  };
  actionToProlong: 'get_all_sum' | 'get_part_sum' | 'reinvest_all';
  valute: string | null;
  cryptoCashCurrency: string | null;
  amount: number | null;
  isOperated: boolean;
  createdAt: string;
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
  isRefundOperation?: boolean;
  refund_value?: number;
  createdAt: string;
}

interface CryptoRate {
  name: string;
  value: number;
}

const ACTION_LABELS: Record<string, string> = {
  get_all_sum: 'Вывести всю сумму',
  get_part_sum: 'Частичный вывод',
  reinvest_all: 'Реинвестировать всё'
};

const VALUTE_LABELS: Record<string, string> = {
  cash: 'Наличные',
  crypto: 'Криптовалюта'
};

const BUTTON_LABELS: Record<string, string> = {
  get_all_sum: 'Выплачено, закрыть портфель',
  get_part_sum: 'Выплачено, продлить',
  reinvest_all: 'Продлить портфель'
};

export const DepositProlongationOne: FC = () => {
  const { prolongationId } = useParams();
  const navigate = useNavigate();
  const [prolongation, setProlongation] = useState<DepositProlongation | null>(null);
  const [operations, setOperations] = useState<DepositOperation[]>([]);
  const [portfolioData, setPortfolioData] = useState<{
    currentPortfolioValue: number;
    totalInitialPrice: number;
    profitEur: number;
    profitPercent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [operating, setOperating] = useState(false);
  const [isOperated, setIsOperated] = useState(false);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const [cryptoRates, setCryptoRates] = useState<Record<string, number>>({});
  const [finalAmount, setFinalAmount] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prolongationRes, ratesRes] = await Promise.all([
          axios.get(`/admin_get_deposit_prolongation_one/${prolongationId}`),
          axios.get('/get_crypto_rates')
        ]);

        if (prolongationRes.data.status === 'success') {
          setProlongation(prolongationRes.data.data);
          setOperations(prolongationRes.data.operations || []);
          setPortfolioData({
            currentPortfolioValue: prolongationRes.data.currentPortfolioValue,
            totalInitialPrice: prolongationRes.data.totalInitialPrice,
            profitEur: prolongationRes.data.profitEur,
            profitPercent: prolongationRes.data.profitPercent,
          });
        }

        if (ratesRes.data.status === 'success') {
          const ratesMap: Record<string, number> = {};
          ratesRes.data.data.forEach((rate: CryptoRate) => {
            ratesMap[rate.name] = rate.value;
          });
          setCryptoRates(ratesMap);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prolongationId]);

  const handleMarkOperated = async () => {
    try {
      setOperating(true);
      const { data } = await axios.post('/admin_mark_prolongation_operated', {
        prolongationId,
        finalAmount: finalAmount ? parseFloat(finalAmount.replace(',', '.')) : null
      });
      if (data.status === 'success') {
        setIsOperated(true);
        setOperationMessage(data.message);
      }
    } catch (error) {
      console.error('Ошибка при обработке заявки:', error);
    } finally {
      setOperating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!prolongation || !portfolioData) {
    return (
      <Page back={true}>
        <div style={{ padding: '0 16px' }}>
          <Text text="Заявка не найдена" />
        </div>
        <AdminTabbarMenu />
      </Page>
    );
  }

  const { currentPortfolioValue, totalInitialPrice, profitEur, profitPercent } = portfolioData;
  const deposit = prolongation.linkToDeposit;

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100 }}>
        <Header2 title="Заявка на продление/выплату" />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>

          {/* Информация о пользователе */}
          <SectionOnPage>
            <Text hometext={`Имя: ${prolongation.user.name || '—'}`} />
            <Text hometext={`Telegram ID: ${prolongation.user.tlgid}`} />
            <Text hometext={`Username: ${prolongation.user.username || 'нет'}`} />
          </SectionOnPage>

          {/* Информация о заявке на продление */}
          <SectionOnPage>
            <Text hometext={`Действие: ${ACTION_LABELS[prolongation.actionToProlong] || prolongation.actionToProlong}`} />
            <Text hometext={`Способ вывода: ${prolongation.valute ? VALUTE_LABELS[prolongation.valute] || prolongation.valute : '—'}`} />
           
            {prolongation.actionToProlong === 'get_part_sum' && (
              <>
                <Text hometext={`Валюта: ${prolongation.cryptoCashCurrency || '—'}`} />
                {prolongation.valute === 'crypto' && prolongation.amount && prolongation.cryptoCashCurrency ? (
                  <Text hometext={`Сумма к выводу: ${prolongation.amount} ${prolongation.cryptoCashCurrency} (${(prolongation.amount * (cryptoRates[prolongation.cryptoCashCurrency] || 0)).toFixed(2)} EUR)`} />
                ) : (
                  <Text hometext={`Сумма к выводу: ${prolongation.amount || '—'} ${prolongation.cryptoCashCurrency || ''}`} />
                )}
              </>
            )}

            {prolongation.actionToProlong === 'get_all_sum' && (
              <>
                {/* <Text hometext={`Способ вывода: ${prolongation.valute ? VALUTE_LABELS[prolongation.valute] || prolongation.valute : '—'}`} /> */}
                <Text hometext={`Валюта: ${prolongation.cryptoCashCurrency || '—'}`} />
                <Text hometext={`Сумма к выводу: ${prolongation.amount || '—'} ${prolongation.cryptoCashCurrency || ''}`} />
              </>
            )}

            <Text hometext={`Дата заявки: ${formatDateTime(prolongation.createdAt)}`} />
          </SectionOnPage>

          {prolongation.actionToProlong === 'get_part_sum' && (
            <SectionOnPage>
              <Text hometext="Укажите финальную сумму выплаты, EUR:" />
              <Input
                type="text"
                value={finalAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.,]/g, '');
                  setFinalAmount(value);
                }}
              />
            </SectionOnPage>
          )}

          {/* Информация по портфелю */}
          <SectionOnPage>
          <Card
            title="Информация по портфелю"
            subtitle="открыть"
            isAccordion={true}
            accordionContent={
              <>
                <Text hometext={`Цена портфеля начальная: € ${deposit?.amountInEur?.toFixed(2) || '—'}`} />

                {deposit?.isRefunded && deposit?.refundHistory?.length > 0 && (
                  <>
                    <div style={{ paddingLeft: '10px' }}>
                      <Text hometext="Пополнения портфеля:" />
                      {deposit.refundHistory.map((item, index) => (
                        <Text
                          key={index}
                          hometext={`${formatDate(item.date)}   € +${item.value}`}
                        />
                      ))}
                    </div>
                    <div style={{ paddingBottom: '10px' }}>
                      <Text hometext={`Цена после пополнения: € ${totalInitialPrice.toFixed(2)}`} />
                    </div>
                  </>
                )}

                <Text hometext={`Цена портфеля текущая: € ${currentPortfolioValue?.toFixed(2) || '—'}`} />
                <Text hometext={`Прибыль по портфелю: ${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}%`} />
                <Text hometext={`Прибыль по портфелю: ${profitEur >= 0 ? '€ +' : '€ '}${profitEur.toFixed(2)}`} />

                <div style={{ marginTop: '16px', borderTop: '1px solid #333', paddingTop: '12px' }}>
                  <Text hometext="Операции по неделям:" />
                </div>

                {operations.length > 0 ? (
                  operations.map((op) => {
                    if (op.isRefundOperation) {
                      return (
                        <div key={op._id} style={{ marginBottom: '12px' }}>
                          <Text hometext={`Пополнение (${formatDate(op.createdAt)}):`} />
                          <div style={{ color: '#000000', fontSize: '14px' }}>
                            € {op.week_start_amount} →{' '}
                            <span style={{ color: '#4ade80' }}>
                              +{op.refund_value}
                            </span>{' '}
                            → € {op.week_finish_amount}
                          </div>
                        </div>
                      );
                    }

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
              </>
            }
          />
          </SectionOnPage>

          {/* Кнопка действия */}
          <SectionOnPage>
            <div style={{display:'flex', gap: '20px', flexDirection: 'column'}}>
            {isOperated || prolongation.isOperated ? (
              <Text style={{ color: '#31b663' }} text={`✅ ${operationMessage || 'Выполнено'}`} />
            ) : (
              <Button
                onClick={handleMarkOperated}
                disabled={operating || (prolongation.actionToProlong === 'get_part_sum' && !finalAmount.trim())}
              >
                {operating ? 'Обработка...' : BUTTON_LABELS[prolongation.actionToProlong] || 'Выполнено'}
              </Button>
            )}
          

          <Button onClick={() => navigate('/depositprolongationall')}>
            Назад
          </Button>
          </div>
          </SectionOnPage>
        </div>
      </div>
      <AdminTabbarMenu />
    </Page>
  );
};
