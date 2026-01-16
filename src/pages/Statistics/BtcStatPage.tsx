import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

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

const formatDate = (dateStr: string): string => {
  // date format: DD-MM-YYYY
  const [day, month, year] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
};

const formatPrice = (price: number): string => {
  return price.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
};

const formatFullDate = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartData }> }) => {
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
          {formatPrice(data.price)} USD
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {formatFullDate(data.date)}
        </div>
      </div>
    );
  }
  return null;
};

export const BtcStatPage: FC = () => {
  const navigate = useNavigate();
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
            displayDate: formatDate(item.date),
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
  }, []);

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
      <div style={{ marginBottom: 100 }}>
        <Header2 title="Статистика Биткоина" />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ width: '100%', height: 300, marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="displayDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#888' }}
                  interval="preserveStartEnd"
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
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#888', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <Button onClick={() => navigate('/mainstat_page')}>
            назад
          </Button>
        </div>
      </div>
      <TabbarMenu />
    </Page>
  );
};
