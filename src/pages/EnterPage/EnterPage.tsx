import { Section, List } from '@telegram-apps/telegram-ui';
import { CircularProgress } from '@mui/material';
import type { FC } from 'react';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { TEXTS } from './texts';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';
import axios from '../../axios';

import { LanguageContext } from '../../components/App.tsx';

import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { useMemo } from 'react';

import { useTlgid } from '../../components/Tlgid';
// import { useUser } from '@/context/UserContext';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

export const EnterPage: FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(LanguageContext);
  const [wentWrong, setWentWrong] = useState(false);

  const lp = useMemo(() => {
    try {
      return retrieveLaunchParams();
    } catch (e) {
      console.error('Ошибка получения launch params:', e);
      return null;
    }
  }, []);

  const { errorT, btnErrorT } = TEXTS[language];

  const { tlgid, username } = useTlgid();
  // const tlgid = 888;

  //   const [showTryLater, setShowTryLater] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const langFromBot = (lp as any)?.langfrombot || 'de';

    console.log('lp', lp)
    console.log('langFromBot=', langFromBot);
    console.log('tlgid=', tlgid)
    // return

    const fetchEnter = async () => {
      try {
        const response = await axios.post('/enter', {
          tlgid: tlgid,
          username: username,
          language: langFromBot,
        });

        if (isCancelled) return;

        console.log('response', response)

        if (!response || response.data.statusBE === 'notOk') {
          setWentWrong(true);
          setIsLoading(false);
          return;
        }

        const { result, isFirstEnter, role, language } = response.data.userData;
        console.log('DATA', response.data.userData);

        if (result === 'showSetPassword') {
          console.log('showSetPassword');
          setLanguage(language);
          navigate('/setpassword', { state: { isFirstEnter } });
        } else if (result === 'showEnterPassword') {
          console.log('showEnterPassword');
          setLanguage(language);
          navigate('/enterpassword', { state: { isFirstEnter, role } });
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        // setShowTryLater(true);
        setWentWrong(true);
        setIsLoading(false);
      }
    };
    fetchEnter();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Early return для ошибки
  if (wentWrong) {
    return (
      <Page back={false}>
        <div
          style={{
            padding: '20px 16px 16px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <Text text={errorT}></Text>
          <Button onClick={() => window.location.reload()}>
            {' '}
            {btnErrorT}{' '}
          </Button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {isLoading && (
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
      )}

      {/* {showTryLater && <TryLater/>} */}

      <List>
        <Section></Section>
      </List>
    </Page>
  );
};
