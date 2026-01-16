import { useState, useEffect, useRef, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
// import { Header } from '@/components/Header/Header.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Input } from '@/components/Input/Input.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { useTlgid } from '@/components/Tlgid.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

export const MyAccountMainPage: FC = () => {
  const navigate = useNavigate();
  const { tlgid } = useTlgid();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const initialUsername = useRef('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`/user/${tlgid}`);
        if (userRes.data.status === 'success') {
          const name = userRes.data.name || '';
          setUsername(name);
          initialUsername.current = name;
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tlgid]);

  const handleSaveUsername = async () => {
    if (username !== initialUsername.current) {
      try {
        await axios.put(`/user/${tlgid}/name`, { name: username });
        initialUsername.current = username;
      } catch (error) {
        console.error('Ошибка при сохранении имени:', error);
      }
    }
  };

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
      <Header2 title="Профиль" />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <Text text="Ваше имя" />
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={handleSaveUsername}
        />

       <Button onClick={() => navigate('/aboutcompany_page')}>
                      О нас
            </Button>   
       <Button onClick={() => navigate('/faq_page')}>
                      FAQ
            </Button>   
       <Button onClick={() => navigate('/support_page')}>
                      Поддержка
            </Button>   
            </div>

</div>
      <TabbarMenu />
    </Page>
  );
};
