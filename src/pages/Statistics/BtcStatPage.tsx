import { useState, useEffect, type FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { LanguageContext } from '../../components/App.tsx';
import { TEXTS, getLocale } from './texts';

interface BitcoinPrice {
  _id: string;
  date: string;
  priceUsd: number;
  priceEur: number | null;
}

interface ChartData {
  date: string;
  displayDate: string;
  price: number;
}

const formatDate = (dateStr: string, locale: string): string => {
  // date format: DD-MM-YYYY
  const [day, month, year] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
};

const formatPrice = (price: number, locale: string): string => {
  return price.toLocaleString(locale, { maximumFractionDigits: 2 });
};

const formatFullDate = (dateStr: string, locale: string): string => {
  const [day, month, year] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

const CustomTooltip = ({ active, payload, locale }: { active?: boolean; payload?: Array<{ payload: ChartData }>; locale: string }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>
          {formatPrice(data.price, locale)} USD
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {formatFullDate(data.date, locale)}
        </div>
      </div>
    );
  }
  return null;
};

export const BtcStatPage: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const locale = getLocale(language);
  const { btcStatTitleT, backT } = TEXTS[language];
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/bitcoin_prices');
        if (response.data.status === 'success') {
          const prices: BitcoinPrice[] = response.data.data;

          // Сортируем по дате (DD-MM-YYYY -> Date)
          const parseToDate = (dateStr: string): Date => {
            const [day, month, year] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
          };

          const sortedPrices = [...prices].sort((a, b) =>
            parseToDate(a.date).getTime() - parseToDate(b.date).getTime()
          );

          const data: ChartData[] = sortedPrices.map((item) => ({
            date: item.date,
            displayDate: formatDate(item.date, locale),
            price: item.priceUsd,
          }));
          setChartData(data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

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
        <Header2 title={btcStatTitleT} />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ marginTop: '16px', marginLeft: '-16px' }}>
              <AreaChart
                data={chartData}
                width={window.innerWidth}
                height={300}
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickFormatter={(dateStr) => {
                    const [day, month, year] = dateStr.split('-');
                    const date = new Date(Number(year), Number(month) - 1, Number(day));
                    return date.toLocaleDateString(locale, { month: 'short' });
                  }}
                  interval={30}
                />
                <YAxis
                  domain={['dataMin - 5000', 'dataMax + 5000']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  width={45}
                />
                <Tooltip
                  content={<CustomTooltip locale={locale} />}
                  cursor={{ stroke: '#888', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fillOpacity={1}
                  activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff', strokeWidth: 2 }}
                  fill="url(#colorPrice)"
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
          </div>

          <Button onClick={() => navigate('/mainstat_page')} style={{ marginTop: 25 }}>
            {backT}
          </Button>
        </div>
      </div>
      <TabbarMenu />
    </Page>
  );
};
