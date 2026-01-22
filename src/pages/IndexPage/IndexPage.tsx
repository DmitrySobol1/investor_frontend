import { useState, useEffect, type FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Card } from '@/components/Card/Card.tsx';
// import { Header } from '@/components/Header/Header.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { CardList } from '@/components/CardList/CardList.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { useTlgid } from '@/components/Tlgid.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';
import { Button } from '@/components/Button/Button.tsx';

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
  refundHistory: RefundHistoryItem[];
  createdAt: string;
  amountInEur: number;
  exchangeRate: number;
  // Значения с бэкенда
  currentPortfolioValue: number;
  totalInitialPrice: number;
  profitPercent: number;
  profitEur: number;
}

export const IndexPage: FC = () => {
  // const { tlgid } = useTlgid();
  const { tlgid: originalTlgid } = useTlgid();
  
  const tlgid = originalTlgid == import.meta.env.VITE_FIRST_TLGID 
  ? import.meta.env.VITE_SECOND_TLGID
  : originalTlgid;

  

  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { yourPortfoliosT, noPortfoliosT, portfolioT, endDateT, detailsT,
          initialPriceT, currentPriceT, portfolioProfitT, totalInitialPriceT,
          endsInDaysT, daysT, portfolioClosedT } = TEXTS[language];
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (tlgid) {
          const depositsRes = await axios.get(`/get_user_deposits/${tlgid}`);
          if (depositsRes.data.status === 'success') {
            setDeposits(depositsRes.data.data);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tlgid]);

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
      {/* <Header title="Easy dev" subtitle="про разработку для «не кодеров»" /> */}
      <Header2 title={yourPortfoliosT} />

      {deposits.length === 0 ? (
        <div style={{ padding: '0 16px' }}>
          <Text text={noPortfoliosT} />
        </div>
      ) : (
        <CardList>
          {deposits.map((deposit, index) => {
            const formatDate = (dateStr: string) => {
              const date = new Date(dateStr);
              return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            };

            const getDaysRemaining = (dateStr: string) => {
              const endDate = new Date(dateStr);
              const today = new Date();
              const diffTime = endDate.getTime() - today.getTime();
              return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            };

            const daysRemaining = getDaysRemaining(deposit.date_until);
            const subtitle = !deposit.isActive
              ? portfolioClosedT
              : deposit.isTimeToProlong
                ? `${endsInDaysT} ${daysRemaining} ${daysT}`
                : `${endDateT}: ${formatDate(deposit.date_until)}`;

            return (
              <Card
                key={deposit._id}
                title={`${portfolioT} ${index + 1}`}
                subtitle={subtitle}
                subtitleColor={!deposit.isActive ? '#ff5252' : deposit.isTimeToProlong ? '#ff9800' : undefined}
                badge={{
                  isShown: deposit.isTimeToProlong || !deposit.isActive,
                  text: "!",
                  color: !deposit.isActive ? "#ff5252" : "#ff9800"
                }}
                isAccordion={true}
                isOpen={openAccordionId === deposit._id}
                onToggle={() => setOpenAccordionId(openAccordionId === deposit._id ? null : deposit._id)}
                accordionContent={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#000000', fontSize: '14px' }}>
                    <div>{initialPriceT}: € {deposit.amountInEur?.toFixed(2)}</div>
                    {deposit.isRefunded &&
                      <div>{totalInitialPriceT}: € {deposit.totalInitialPrice?.toFixed(2)}</div>
                    }
                    <div>{currentPriceT}: € {deposit.currentPortfolioValue?.toFixed(2)}</div>
                    <div>{portfolioProfitT}: {deposit.profitPercent >= 0 ? '+' : ''}{deposit.profitPercent?.toFixed(2)}%</div>
                    <div>{portfolioProfitT}: {deposit.profitEur >= 0 ? '€ +' : '€ '}{deposit.profitEur?.toFixed(2)}</div>
                    <Button onClick={() => navigate(`/detailed_deposit/${deposit._id}`)}>{detailsT}</Button>
                  </div>
                }
              />
            );
          })}
        </CardList>
      )}


     
</div>
      <TabbarMenu />
    </Page>
  );
};
