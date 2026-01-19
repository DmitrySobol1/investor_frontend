import { useState, useEffect, type FC } from 'react';
import axios from '@/axios';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Card } from '@/components/Card/Card.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { CardList } from '@/components/CardList/CardList.tsx';
import { Text } from '@/components/Text/Text.tsx';
import { Button } from '@/components/Button/Button.tsx';

import { AdminTabbarMenu } from '../../components/AdminTabbarMenu/AdminTabbarMenu.tsx';

interface Question {
  _id: string;
  question: string;
  isOperated: boolean;
  createdAt: string;
  user: {
    _id: string;
    name?: string;
    tlgid: number;
  };
}

export const QuestionToSupportPage: FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      const { data } = await axios.get('/admin_get_all_questions');
      if (data.status === 'success') {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке вопросов:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleMarkAnswered = async (questionId: string) => {
    try {
      const { data } = await axios.post('/admin_mark_question_answered', { questionId });
      if (data.status === 'success') {
        setQuestions(questions.filter(q => q._id !== questionId));
      }
    } catch (error) {
      console.error('Ошибка при отметке вопроса:', error);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
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

  return (
    <Page back={true}>
      <div style={{ marginBottom: 100}}>
        <Header2 title="Вопросы в поддержку" />

        {questions.length === 0 ? (
          <div style={{ padding: '0 16px' }}>
            <Text text="Нет вопросов" />
          </div>
        ) : (
          <CardList>
            {questions.map((question) => (
              <Card
                key={question._id}
                title={question.user?.name || 'Без имени'}
                subtitle={formatDateTime(question.createdAt)}
                isAccordion={true}
                isOpen={openAccordionId === question._id}
                onToggle={() => setOpenAccordionId(openAccordionId === question._id ? null : question._id)}
                accordionContent={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#000000', fontSize: '14px' }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{question.question}</div>
                    {question.isOperated === true ? (
                      <div style={{ color: '#4ade80', fontWeight: 500 }}>Отвечено</div>
                    ) : (
                      <Button onClick={() => handleMarkAnswered(question._id)}>
                        Пометить отвеченным
                      </Button>
                    )}
                  </div>
                }
              />
            ))}
          </CardList>
        )}
      </div>
      <AdminTabbarMenu />
    </Page>
  );
};
