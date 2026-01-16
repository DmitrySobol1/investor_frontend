import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';




export const AboutPage: FC = () => {
  const navigate = useNavigate();
  const [loading] = useState(false);



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
      <Header2 title="О нас" />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <Text text={`Как компания, мы предлагаем уникальный подход к сотрудничеству с нашими клиентами. Мы уверены в качестве наших услуг настолько, что мы берем процент от вашей прибыли только после того, как вы начнете успешно зарабатывать благодаря нашим усилиям. Этот подход демонстрирует нашу готовность работать на результат.
Мы готовы инвестировать наше время, умения и ресурсы в ваш проект, стремясь к тому, чтобы ваш бизнес процветал. Наша оплата привязана к вашему успеху, поэтому наша цель - обеспечить вас лучшими результатами.
Одним из ключевых элементов нашего сотрудничества является длительный период отсрочки оплаты. Мы предлагаем 12 месяцев без взимания оплаты, чтобы вы могли убедиться в эффективности наших услуг и убедиться в их превосходстве. Только после этого мы берем часть от вашей прибыли, создавая взаимовыгодные условия для сотрудничества.
Этот подход позволяет нам сфокусироваться на вашем успехе и создать долгосрочные партнерские отношения. Мы заинтересованы в вашем процветании так же, как и вы сами, и готовы вложить усилия для достижения общей цели.
Наши клиенты ценят этот подход, так как он демонстрирует наше доверие к собственным способностям и уверенность в реальном улучшении их бизнеса. Мы стремимся быть не просто поставщиками услуг, а долгосрочными партнерами, готовыми идти в ногу с вашими успехами и помогать вам в их достижении.`}></Text>

       <Button onClick={() => navigate('/myaccount-main_page')}>
                      назад
            </Button>   
        
            </div>

</div>
      <TabbarMenu />
    </Page>
  );
};
