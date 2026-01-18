import { useState, type FC, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Input } from '@/components/Input/Input.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { useTlgid } from '@/components/Tlgid.tsx';

import { LanguageContext } from '../../components/App.tsx';
import { TEXTS } from './texts';

export const EnterPasswordPage: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { enterpasswordT, inputT, btnT, forgotBtnT, wrongPasswordT, errorT, requestSentT, requestDescT } = TEXTS[language];
  const location = useLocation();
  const { isFirstEnter } = (location.state as { isFirstEnter?: boolean }) || {};
  const { role } = (location.state as { role?: string }) || {};
  const { tlgid } = useTlgid();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);

  const handleCheckPassword = async () => {
    try {
      setLoading(true);
      setError(false);
      setErrorText('');

      const response = await axios.post('/checkPassword', {
        tlgid,
        password
      });

      if (response.data.status === 'success') {
        if (isFirstEnter === true) {
          
          navigate('/createdeposit', { state: { isFirstEnter } });
        } else {
          if (role === 'admin'){
              navigate('/adminenter');
          } else {
              navigate('/index');
          }
        }
      } else {
        setError(true);
        setErrorText(wrongPasswordT);
      }
    } catch (err) {
      console.error('Ошибка при проверке пароля:', err);
      setError(true);
      setErrorText(errorT);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      setError(false);
      setErrorText('');

      const response = await axios.post('/new_changepassword_rqst', { tlgid });

      if (response.data.status === 'success') {
        setIsPasswordResetSent(true);
      }
    } catch (err) {
      console.error('Ошибка при запросе смены пароля:', err);
      setError(true);
      setErrorText(errorT);
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

  if (isPasswordResetSent) {
    return (
      <Page back={false}>
        <div style={{ marginBottom: 100 }}>
          <Header2 title={requestSentT} />
          <div style={{ padding: '0 16px' }}>
            <p style={{ color: '#9ca3af', textAlign: 'left', lineHeight: 1.6 }}>
              {requestDescT}
            </p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page back={false}>
      <div style={{ marginBottom: 100}}>
      <Header2 title={enterpasswordT} />

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          type="password"
          placeholder={inputT}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button disabled={password.length === 0} onClick={handleCheckPassword}>
          {btnT}
        </Button>
        <Button onClick={handleForgotPassword}>
          {forgotBtnT}
        </Button>
        {error && (
          <p style={{ color: '#ef4444', margin: 0, textAlign: 'center' }}>
            {errorText}
          </p>
        )}
      </div>
</div>
    </Page>
  );
};
