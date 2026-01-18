import { useState, type FC, useContext } from 'react';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Input } from '@/components/Input/Input.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { useTlgid } from '@/components/Tlgid.tsx';
import { useNavigate } from 'react-router-dom';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { LanguageContext } from '../../components/App.tsx';
import { TEXTS } from './texts';

export const SupportPage: FC = () => {
  const { tlgid } = useTlgid();
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { supportT, backT, requestSentT, writeQuestionT, enterQuestionT, sendT } = TEXTS[language];
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [isRequestSent, setIsRequestSent] = useState(false);

  const handleSendRequest = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/new_request_to_support', {
        tlgid,
        question
      });

      if (response.data.status === 'success') {
        setIsRequestSent(true);
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
    } finally {
      setLoading(false);
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

  if (isRequestSent) {
    return (
      <Page back={true}>
        <div style={{ marginBottom: 100 }}>
          <Header2 title={supportT} />
          <div style={{ padding: '0 16px' }}>
            <Text text={requestSentT} />
            <Button onClick={() => navigate('/myaccount-main_page')}>
                      {backT}
            </Button> 
          </div>
        </div>
        <TabbarMenu />
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100 }}>
        <Header2 title={supportT} />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Text text={writeQuestionT} />
          <Input
            type="text"
            placeholder={enterQuestionT}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button
            disabled={question.length === 0}
            onClick={handleSendRequest}
          >
            {sendT}
          </Button>
           <Button onClick={() => navigate('/myaccount-main_page')}>
                      {backT}
            </Button> 
        </div>
      </div>
      <TabbarMenu />
    </Page>
  );
};
