import { useState, type FC, useContext} from 'react';
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

export const SetPasswordPage: FC = () => {

   const { language } = useContext(LanguageContext);

    const { setpasswordT, inputT, btnT, errorT } = TEXTS[language];


  const navigate = useNavigate();
  const location = useLocation();
  const { isFirstEnter } = (location.state as { isFirstEnter?: boolean }) || {};
  const { tlgid } = useTlgid();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false)
  const [errorText, setErrorText] = useState('');

  const handleSetPassword = async () => {
    try {
      setLoading(true);
      setErrorText('');

      const response = await axios.post('/setPassword', {
        tlgid,
        password
      });

      if (response.data.status === 'success') {
        if (isFirstEnter === true) {
          navigate('/createdeposit', { state: { isFirstEnter } });
        } else {
          navigate('/index');
        }
      } else {
        setError(true)
        setErrorText(errorT);
      }
    } catch (err) {
      console.error('Ошибка при установке пароля:', err);
      setError(true)
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

  return (
    <Page back={false}>
      <div style={{ marginBottom: 100}}>
      <Header2 title={setpasswordT} />

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          type="password"
          placeholder={inputT}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button disabled={password.length === 0} onClick={handleSetPassword}>
          {btnT}
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
