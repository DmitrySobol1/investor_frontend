import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

interface ChangePasswordRequest {
  _id: string;
  user: {
    _id: string;
    tlgid: string;
  };
  isOperated: boolean;
  status: string;
  createdAt: string;
}

export const ChangePasswordOne: FC = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ChangePasswordRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const { data } = await axios.get(`/admin_get_changepassword_rqst_one/${requestId}`);
        if (data.status === 'success') {
          setRequest(data.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке заявки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  const handleResetPassword = async () => {
    try {
      setResetting(true);
      const { data } = await axios.post('/admin_reset_password', { requestId });
      if (data.status === 'success') {
        setIsReset(true);
      }
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error);
    } finally {
      setResetting(false);
    }
  };

  const handleRejectRequest = async () => {
    try {
      setRejecting(true);
      const { data } = await axios.post('/admin_reject_changepassword_rqst', { requestId });
      if (data.status === 'success') {
        setIsRejected(true);
      }
    } catch (error) {
      console.error('Ошибка при отклонении заявки:', error);
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (!request) {
    return (
      <Page back={true}>
        <div style={{ padding: '0 16px' }}>
          <Text text="Заявка не найдена" />
        </div>
        <AdminTabbarMenu />
      </Page>
    );
  }

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100 }}>
          <Header2 title="Заявка на смену пароля" />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Text text={`Telegram ID: ${request.user.tlgid}`} />
          <Text text={`Статус: ${request.status}`} />
          <Text text={`Дата создания: ${formatDate(request.createdAt)}`} />

          {isReset || isRejected ? (
            <Text text={isReset ? "Пароль обнулён" : "Заявка отклонена"} />
          ) : (
            <>
              <Button onClick={handleResetPassword} disabled={resetting || rejecting}>
                {resetting ? 'Обработка...' : 'Обнулить пароль'}
              </Button>
              <Button onClick={handleRejectRequest} disabled={resetting || rejecting}>
                {rejecting ? 'Обработка...' : 'Отклонить заявку'}
              </Button>
            </>
          )}
          <Button onClick={() => navigate('/changepasswordall')}>
            Назад
          </Button>
        </div>
      </div>
      <AdminTabbarMenu />
    </Page>
  );
};
