import { Section, List } from '@telegram-apps/telegram-ui';
import { CircularProgress } from '@mui/material';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from '../../axios';

import { useTlgid } from '../../components/Tlgid';
// import { useUser } from '@/context/UserContext';

// import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';

// import {TryLater} from '../../components/TryLater/TryLater.tsx'

export const EnterPage: FC = () => {
  const navigate = useNavigate();

    const { tlgid } = useTlgid();
  // const tlgid = 888;

  //   const [showTryLater, setShowTryLater] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchEnter = async () => {
      try {
        const response = await axios.post('/enter', { tlgid: tlgid });

        if (isCancelled) return;

        if (!response || response.data.statusBE === 'notOk') {
          //   setShowTryLater(true);
          setIsLoading(false);
          return;
        }

        const { result, isFirstEnter, role } = response.data.userData;
        console.log('DATA',response.data.userData )
        

        if (result === 'showSetPassword') {
          console.log('showSetPassword');
          navigate('/setpassword', { state: { isFirstEnter } });
        } else if (result === 'showEnterPassword') {
          console.log('showEnterPassword');
          navigate('/enterpassword', { state: { isFirstEnter, role } });
        }
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        // setShowTryLater(true);
        setIsLoading(false);
      }
    };
    fetchEnter();

    return () => {
      isCancelled = true;
    };
  }, []);

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
