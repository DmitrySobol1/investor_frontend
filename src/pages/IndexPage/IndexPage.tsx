import { useState, useEffect, type FC } from 'react';
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
  currentPortfolioValue: number;
}

export const IndexPage: FC = () => {
  const { tlgid } = useTlgid();
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

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
      <Header2 title="Ваши портфели" />

      {deposits.length === 0 ? (
        <div style={{ padding: '0 16px' }}>
          <Text text="У вас еще нет подтвержденных портфелей" />
        </div>
      ) : (
        <CardList>
          {[...deposits]
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map((deposit, index) => {
            const formatDate = (dateStr: string) => {
              const date = new Date(dateStr);
              return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
            };

            return (
              <Card
                key={deposit._id}
                title={`Портфель ${index + 1}`}
                subtitle={`дата окончания: ${formatDate(deposit.date_until)}`}
                // badge={{
                //   isShown: true,
                //   text: deposit.isActive ? 'Активен' : 'Завершен',
                //   color: deposit.isActive ? '#4ade80' : '#9ca3af',
                // }}
                isAccordion={true}
                accordionContent={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
                    <div>Цена портфеля начальная: € {deposit.amountInEur?.toFixed(2)}</div>
                    <div>Цена портфеля текущая: € {deposit.currentPortfolioValue?.toFixed(2)}</div>
                    <div>Прибыль по портфелю: {deposit.amountInEur > 0 ? (((deposit.currentPortfolioValue - deposit.amountInEur) / deposit.amountInEur) * 100).toFixed(2) : 0}%</div>
                    <div>Прибыль по портфелю: € {(deposit.currentPortfolioValue - deposit.amountInEur).toFixed(2)}</div>
                    <Button onClick={() => navigate(`/detailed_deposit/${deposit._id}`)}> Подробнее </Button>

                    {/* <div>Валюта: {deposit.cryptoCashCurrency}</div>
                    <div>Сумма: {deposit.amount} {deposit.cryptoCashCurrency}</div>
                    <div>Дата создания: {formatDate(deposit.createdAt)}</div>
                    <div>Дата окончания: {formatDate(deposit.date_until)}</div>
                    <div>Уровень риска: {deposit.riskPercent}%</div>
                    <div>Статус: {deposit.isActive ? 'Активен' : 'Завершен'}</div> */}
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
