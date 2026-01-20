import { useState, useEffect, type FC, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { SectionOnPage } from '@/components/SectionOnPage/SectionOnPage';
import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { LanguageContext } from '../../components/App.tsx';
import { TEXTS } from './texts';

interface RefundHistoryItem {
  date: string;
  value: number;
}

interface Deposit {
  _id: string;
  valute: string;
  cryptoCashCurrency: string;
  amount: number;
  period: number;
  date_until: string;
  riskPercent: number;
  isActive: boolean;
  isRefunded: boolean;
  refundHistory: RefundHistoryItem[];
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
  isRefundOperation?: boolean;
  refund_value?: number;
  createdAt: string;
}

// Данные с бэкенда
interface DepositResponse {
  status: string;
  data: Deposit;
  operations: DepositOperation[];
  currentPortfolioValue: number;
  totalInitialPrice: number;
  profitEur: number;
  profitPercent: number;
}

export const DetailedDepositPage: FC = () => {
  const { depositId } = useParams();
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const {
    portfolioNotFoundT,
    portfolioInfoT,
    initialPriceT,
    currentPriceT,
    portfolioProfitT,
    weekT,
    noWeekDataT,
    backT,
    refundHistoryT,
    totalInitialPriceT,
    refundDepositT,
  } = TEXTS[language];
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [operations, setOperations] = useState<DepositOperation[]>([]);
  const [portfolioData, setPortfolioData] = useState<{
    currentPortfolioValue: number;
    totalInitialPrice: number;
    profitEur: number;
    profitPercent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const { data } = await axios.get<DepositResponse>(
          `/get_deposit_one/${depositId}`,
        );
        if (data.status === 'success') {
          setDeposit(data.data);
          setOperations(data.operations || []);
          setPortfolioData({
            currentPortfolioValue: data.currentPortfolioValue,
            totalInitialPrice: data.totalInitialPrice,
            profitEur: data.profitEur,
            profitPercent: data.profitPercent,
          });
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

  if (!deposit || !portfolioData) {
    return (
      <Page back={true}>
        <div style={{ padding: '0 16px' }}>
          <Text text={portfolioNotFoundT} />
        </div>
      </Page>
    );
  }

  const { currentPortfolioValue, totalInitialPrice, profitEur, profitPercent } =
    portfolioData;

  const formatDate = (dateString: string) => {
    const dateLocale = language === 'ru' ? 'ru-RU' : 'de-DE';
    return new Date(dateString).toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100 }}>
        <Header2 title={portfolioInfoT} />
        <div
          style={{
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          <SectionOnPage>
            <Text
              hometext={`${initialPriceT}: € ${deposit.amountInEur?.toFixed(2)}`}
            />

            {deposit.isRefunded && deposit.refundHistory?.length > 0 && (
              <>
                <div style={{ paddingLeft: '10px' }}>
                  <Text hometext={refundHistoryT} />
                    {deposit.refundHistory.map((item, index) => (
                      <Text
                        key={index}
                        hometext={`${formatDate(item.date)}   € +${item.value}`}
                      />
                    ))}
                </div>
                <div style={{ paddingBottom: '10px' }}>
                  <Text
                    hometext={`${totalInitialPriceT}: € ${totalInitialPrice.toFixed(2)}`}
                  />
                </div>
              </>
            )}

            <Text
              hometext={`${currentPriceT}: € ${currentPortfolioValue?.toFixed(2)}`}
            />
            <Text
              hometext={`${portfolioProfitT}: ${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}%`}
            />
            <Text
              hometext={`${portfolioProfitT}: ${profitEur >= 0 ? '€ +' : '€ '} ${profitEur.toFixed(2)}`}
            />
          </SectionOnPage>

          <SectionOnPage>
            {operations.length > 0 ? (
              operations.map((op) => {
                const dateLocale = language === 'ru' ? 'ru-RU' : 'de-DE';

                // Если это операция пополнения
                if (op.isRefundOperation) {
                  return (
                    <div key={op._id} style={{ marginBottom: '12px' }}>
                      <Text
                        hometext={`${refundDepositT} (${formatDate(op.createdAt)}):`}
                      />
                      <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                        € {op.week_start_amount} →{' '}
                        <span style={{ color: '#4ade80' }}>
                          +{op.refund_value}
                        </span>{' '}
                        → € {op.week_finish_amount}
                      </div>
                    </div>
                  );
                }

                const startDate = new Date(
                  op.week_date_start,
                ).toLocaleDateString(dateLocale, {
                  day: '2-digit',
                  month: '2-digit',
                });
                const endDate = new Date(
                  op.week_date_finish,
                ).toLocaleDateString(dateLocale, {
                  day: '2-digit',
                  month: '2-digit',
                });
                const profitEurWeek = (
                  (op.week_start_amount * op.profit_percent) /
                  100
                ).toFixed(2);
                const profitColor =
                  op.profit_percent >= 0 ? '#4ade80' : '#ef4444';
                const profitSign = op.profit_percent >= 0 ? '+' : '';

                return (
                  <div key={op._id} style={{ marginBottom: '12px' }}>
                    <Text
                      hometext={`${weekT} ${op.number_of_week} (${startDate}-${endDate}):`}
                    />
                    <div style={{ color: '#9ca3af', fontSize: '14px' }}>
                      € {op.week_start_amount} →{' '}
                      <span style={{ color: profitColor }}>
                        {profitSign}
                        {op.profit_percent}%
                      </span>{' '}
                      (€ {profitEurWeek}) → € {op.week_finish_amount}
                    </div>
                  </div>
                );
              })
            ) : (
              <Text hometext={noWeekDataT} />
            )}
          </SectionOnPage>

          <Button onClick={() => navigate('/index')}>{backT}</Button>
        </div>
      </div>
      <TabbarMenu />
    </Page>
  );
};
