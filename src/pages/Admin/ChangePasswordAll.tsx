import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';

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

export const ChangePasswordAll: FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ChangePasswordRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await axios.get('/admin_get_changepassword_rqst');
        if (data.status === 'success') {
          setRequests(data.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке заявок:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

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
      <div style={{ marginBottom: 100}}>
      <Header2 title="Заявки на восстановление пароля" />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {requests.map((request: ChangePasswordRequest) => (
        <Button key={request._id} onClick={() => navigate(`/changepasswordone/${request._id}`)}>
          {request.user.tlgid}
        </Button>
      ))}

      {requests.length === 0 && (
        <p style={{ color: '#9ca3af', textAlign: 'center' }}>Нет заявок на смену пароля</p>
      )}
            </div>

</div>
      <AdminTabbarMenu />
    </Page>
  );
};
