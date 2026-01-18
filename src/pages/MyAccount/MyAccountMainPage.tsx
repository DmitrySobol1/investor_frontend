import { useState, useEffect, useRef, type FC, useContext } from 'react';
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
import { SectionOnPage } from '@/components/SectionOnPage/SectionOnPage.tsx';

import { LanguageContext } from '../../components/App.tsx';
import { TEXTS } from './texts';

export const MyAccountMainPage: FC = () => {
  const navigate = useNavigate();
  const { tlgid } = useTlgid();
  const { language, setLanguage } = useContext(LanguageContext);
  const { profileT, yourNameT, appLanguageT,  aboutUsT, supportT } = TEXTS[language];
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

  const handleLanguageChange = async (newLanguage: 'ru' | 'de') => {
    setLanguage(newLanguage);
    try {
      await axios.put(`/user/${tlgid}/language`, { language: newLanguage });
    } catch (error) {
      console.error('Ошибка при сохранении языка:', error);
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
      <Header2 title={profileT} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <SectionOnPage>
          <div style={{marginBottom:'20px'}}>
          <Text text={yourNameT} />
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={handleSaveUsername}
          />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '30px'}}>
            <span style={{color: 'white', fontSize: '16px'}}>{appLanguageT}</span>
            <img
              src={new URL('./de.jpg', import.meta.url).href}
              alt="DE"
              onClick={() => handleLanguageChange('de')}
              style={{
                width: '30px',
                cursor: 'pointer',
                border: language === 'de' ? '2px solid #4ade80' : '2px solid transparent',
                borderRadius: '4px'
              }}
            />
            <img
              src={new URL('./ru.jpg', import.meta.url).href}
              alt="RU"
              onClick={() => handleLanguageChange('ru')}
              style={{
                width: '30px',
                cursor: 'pointer',
                border: language === 'ru' ? '2px solid #4ade80' : '2px solid transparent',
                borderRadius: '4px'
              }}
            />
          </div>
          
        </SectionOnPage>
        

       <Button onClick={() => navigate('/aboutcompany_page')}>
                      {aboutUsT}
            </Button>   
       <Button onClick={() => navigate('/faq_page')}>
                      FAQ
            </Button>   
       <Button onClick={() => navigate('/support_page')}>
                      {supportT}
            </Button>   
            </div>

</div>
      <TabbarMenu />
    </Page>
  );
};
