import { useState, type FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

import { Page } from '@/components/Page.tsx';
import { Button } from '@/components/Button/Button.tsx';
import { Header2 } from '@/components/Header2/Header2.tsx';
import { Text } from '@/components/Text/Text.tsx';

import { TabbarMenu } from '../../components/TabbarMenu/TabbarMenu.tsx';

import { LanguageContext } from '../../components/App.tsx';
import { TEXTS } from './texts';




export const AboutPage: FC = () => {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { aboutUsT, aboutTextT, backT } = TEXTS[language];
  const [loading] = useState(false);



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
      <Header2 title={aboutUsT} />
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        <Text text={aboutTextT}></Text>

       <Button onClick={() => navigate('/myaccount-main_page')}>
                      {backT}
            </Button>   
        
            </div>

</div>
      <TabbarMenu />
    </Page>
  );
};
