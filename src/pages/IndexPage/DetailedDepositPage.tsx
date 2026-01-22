import { useState, useEffect, type FC, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Input } from '@/components/Input/Input.tsx';
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
  isTimeToProlong: boolean;
  isMadeActionToProlong: boolean;
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
    daysT,
    portfolioEndsInT,
    possibleActionsT,
    withdrawAllT,
    withdrawPartT,
    extendYearT,
    requestSentT,
    whichCurrencyT,
    cashT,
    cryptoT,
    selectCryptoT,
    howMuchWithdrawT,
    amountInT,
    doneT,
    amountExceedsT,
    maxT,
    portfolioClosedT,
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

  const [isShowGetAllSum, setIsShowGetAllSum] = useState(false)
  const [isShowCryptoOptions, setIsShowCryptoOptions] = useState(false)

  // States для флоу "Забрать часть суммы"
  const [isShowGetPartSum, setIsShowGetPartSum] = useState(false)
  const [isShowGetPartSumCrypto, setIsShowGetPartSumCrypto] = useState(false)
  const [isShowGetPartSumInput, setIsShowGetPartSumInput] = useState(false)
  const [partSumValute, setPartSumValute] = useState<'cash' | 'crypto'>('cash')
  const [partSumCurrency, setPartSumCurrency] = useState('EUR')
  const [partSumAmount, setPartSumAmount] = useState('')
  const [cryptoRates, setCryptoRates] = useState<{name: string, value: number}[]>([])
  const [validationError, setValidationError] = useState('')

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

  // Загрузка курсов криптовалют
  useEffect(() => {
    const fetchCryptoRates = async () => {
      try {
        const { data } = await axios.get('/get_crypto_rates');
        if (data.status === 'success') {
          setCryptoRates(data.data);
        }
      } catch (error) {
        console.error('Error loading crypto rates:', error);
      }
    };
    fetchCryptoRates();
  }, []);

  // Валидация суммы для "Забрать часть суммы"
  const validatePartSumAmount = (amount: string): boolean => {
    if (!portfolioData || !amount) {
      setValidationError('');
      return false;
    }

    // Заменяем запятую на точку для парсинга
    const normalizedAmount = amount.replace(',', '.');
    const numAmount = Number(normalizedAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('');
      return false;
    }

    if (partSumValute === 'cash') {
      // Для EUR: сравниваем напрямую с currentPortfolioValue
      if (numAmount > portfolioData.currentPortfolioValue) {
        setValidationError(`${amountExceedsT} (${maxT} ${portfolioData.currentPortfolioValue.toFixed(2)} EUR)`);
        return false;
      }
    } else {
      // Для крипты: конвертируем currentPortfolioValue в крипту
      const rate = cryptoRates.find(r => r.name === partSumCurrency);
      if (rate && rate.value > 0) {
        const maxInCrypto = portfolioData.currentPortfolioValue / rate.value;
        if (numAmount > maxInCrypto) {
          // USDT - 2 знака, BTC/ETH - 6 знаков
          const decimals = partSumCurrency === 'USDT' ? 2 : 6;
          setValidationError(`${amountExceedsT} (${maxT} ${maxInCrypto.toFixed(decimals)} ${partSumCurrency})`);
          return false;
        }
      }
    }

    setValidationError('');
    return true;
  };

  const handleProlongAction = async (
    valute: 'cash' | 'crypto' | null,
    cryptoCashCurrency: string | null,
    actionToProlong: 'get_all_sum' | 'get_part_sum' | 'reinvest_all' = 'get_all_sum',
    customAmount?: number | null
  ) => {
    if (!deposit) return;

    try {
      const { data } = await axios.post('/deposit_prolong_action', { 
        depositId: deposit._id,
        actionToProlong,
        valute,
        cryptoCashCurrency,
        amount: customAmount ?? (portfolioData?.currentPortfolioValue || null)
      });

      if (data.status === 'success') {
        setDeposit({ ...deposit, isMadeActionToProlong: true });
        // Сброс состояний get_all_sum
        setIsShowGetAllSum(false);
        setIsShowCryptoOptions(false);
        // Сброс состояний get_part_sum
        setIsShowGetPartSum(false);
        setIsShowGetPartSumCrypto(false);
        setIsShowGetPartSumInput(false);
        setPartSumAmount('');
      }
    } catch (error) {
      console.error('Error submitting prolong action:', error);
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

  const getDaysRemaining = (dateStr: string) => {
    const endDate = new Date(dateStr);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining(deposit.date_until);

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

          {/* Закрытый портфель */}
          {!deposit.isActive && (
            <SectionOnPage>
              <Text
                text={portfolioClosedT}
                style={{ color: '#ff5252' }}
              />
            </SectionOnPage>
          )}

          {deposit.isActive && deposit.isTimeToProlong && deposit.isMadeActionToProlong &&
            <SectionOnPage>
              <Text
                  text={`${portfolioEndsInT} ${daysRemaining} ${daysT}`}
                  style={{ color: '#ff9800' }}
                />
              <Text
                // TODO: указать, заявка на ЧТО
                text={requestSentT}
                style={{ color: '#ff9800' }}
              ></Text>
            </SectionOnPage>
          }  


          {deposit.isActive && deposit.isTimeToProlong && !deposit.isMadeActionToProlong && !isShowGetAllSum && !isShowGetPartSum && (
            <SectionOnPage>
              <Text
                text={`${portfolioEndsInT} ${daysRemaining} ${daysT}`}
                style={{ color: '#ff9800' }}
              />
              <Text
                text={possibleActionsT}
                style={{ color: '#ff9800' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                <Button onClick={() => setIsShowGetAllSum(true)}>{withdrawAllT}</Button>
                <Button onClick={() => setIsShowGetPartSum(true)}>{withdrawPartT}</Button>
                <Button onClick={() => handleProlongAction(null, null, 'reinvest_all', null)}>{extendYearT}</Button>
              </div>
            </SectionOnPage>
          )}


           {/* Забрать всю сумму  */}
           {deposit.isActive && isShowGetAllSum && !isShowCryptoOptions &&
              <SectionOnPage>
                <Text
                text={`${portfolioEndsInT} ${daysRemaining} ${daysT}`}
                style={{ color: '#ff9800' }}
              />

                <Text text={whichCurrencyT}></Text>
                <div style={{display:'flex', gap: '10px'}}>
                  <Button onClick={() => handleProlongAction('cash', 'EUR', 'get_all_sum')}>{cashT}</Button>
                  <Button onClick={() => setIsShowCryptoOptions(true)}>{cryptoT}</Button>
                </div>
              </SectionOnPage>
          }

          {/* Выбор криптовалюты */}
          {deposit.isActive && isShowCryptoOptions &&
              <SectionOnPage>
                <Text
                text={`${portfolioEndsInT} ${daysRemaining} ${daysT}`}
                style={{ color: '#ff9800' }}
              />

                <Text text={selectCryptoT}></Text>
                <div style={{display:'flex', gap: '10px'}}>
                  <Button onClick={() => handleProlongAction('crypto', 'USDT', 'get_all_sum')}>USDT</Button>
                  <Button onClick={() => handleProlongAction('crypto', 'BTC', 'get_all_sum')}>BTC</Button>
                  <Button onClick={() => handleProlongAction('crypto', 'ETH', 'get_all_sum')}>ETH</Button>
                </div>
              </SectionOnPage>
          }

          {/* Забрать часть суммы - выбор валюты */}
          {deposit.isActive && isShowGetPartSum && !isShowGetPartSumCrypto && !isShowGetPartSumInput && (
            <SectionOnPage>
              <Text
                text={`${portfolioEndsInT} ${daysRemaining} ${daysT}`}
                style={{ color: '#ff9800' }}
              />
              <Text text={whichCurrencyT}></Text>
              <div style={{display:'flex', gap: '10px'}}>
                <Button onClick={() => {
                  setPartSumValute('cash');
                  setPartSumCurrency('EUR');
                  setIsShowGetPartSumInput(true);
                  setValidationError('');
                  setPartSumAmount('');
                }}>{cashT}</Button>
                <Button onClick={() => setIsShowGetPartSumCrypto(true)}>{cryptoT}</Button>
              </div>
            </SectionOnPage>
          )}

          {/* Забрать часть суммы - выбор криптовалюты */}
          {deposit.isActive && isShowGetPartSumCrypto && !isShowGetPartSumInput && (
            <SectionOnPage>
              <Text
                text={`${portfolioEndsInT} ${daysRemaining} ${daysT}`}
                style={{ color: '#ff9800' }}
              />
              <Text text={selectCryptoT}></Text>
              <div style={{display:'flex', gap: '10px'}}>
                <Button onClick={() => {
                  setPartSumValute('crypto');
                  setPartSumCurrency('USDT');
                  setIsShowGetPartSumInput(true);
                  setValidationError('');
                  setPartSumAmount('');
                }}>USDT</Button>
                <Button onClick={() => {
                  setPartSumValute('crypto');
                  setPartSumCurrency('BTC');
                  setIsShowGetPartSumInput(true);
                  setValidationError('');
                  setPartSumAmount('');
                }}>BTC</Button>
                <Button onClick={() => {
                  setPartSumValute('crypto');
                  setPartSumCurrency('ETH');
                  setIsShowGetPartSumInput(true);
                  setValidationError('');
                  setPartSumAmount('');
                }}>ETH</Button>
              </div>
            </SectionOnPage>
          )}

          {/* Забрать часть суммы - ввод суммы */}
          {deposit.isActive && isShowGetPartSumInput && (
            <SectionOnPage>
              <Text
                text={`${portfolioEndsInT} ${daysRemaining} ${daysT}`}
                style={{ color: '#ff9800' }}
              />
              <Text text={`${howMuchWithdrawT} (${partSumCurrency})?`}></Text>
              <Input
                type="text"
                inputMode="decimal"
                value={partSumAmount}
                onChange={(e) => {
                  setPartSumAmount(e.target.value);
                  validatePartSumAmount(e.target.value);
                }}
                placeholder={`${amountInT} ${partSumCurrency}`}
              />
              {validationError && (
                <Text
                  text={validationError}
                  style={{ color: '#ef4444', marginTop: '4px' }}
                />
              )}
              <Button
                onClick={() => handleProlongAction(
                  partSumValute,
                  partSumCurrency,
                  'get_part_sum',
                  Number(partSumAmount.replace(',', '.'))
                )}
                style={{ marginTop: '10px' }}
                disabled={!!validationError || !partSumAmount}
              >
                {doneT}
              </Button>
            </SectionOnPage>
          )}

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
