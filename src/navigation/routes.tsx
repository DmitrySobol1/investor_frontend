import type { ComponentType, JSX } from 'react';

import { IndexPage } from '@/pages/IndexPage/IndexPage';
import { DetailedDepositPage } from '@/pages/IndexPage/DetailedDepositPage';


import { SetPasswordPage } from '@/pages/SetPasswordPage/SetPasswordPage';
import { EnterPasswordPage } from '@/pages/EnterPasswordPage/EnterPasswordPage';

import { CreateDepositPage } from '@/pages/DepositPage/CreateDepositPage';
import { DepositRqstDone } from '@/pages/DepositPage/DepositRqstDone';

import { MainAdminPage } from '@/pages/Admin/MainAdmin';
import { AdminEnterPage } from '@/pages/Admin/AdminEnter';
import { UsersAll } from '@/pages/Admin/UsersAll';
import { DepositRqstAll } from '@/pages/Admin/DepositRqstAll';
import { DepositRqstOne } from '@/pages/Admin/DepositRqstOne';
import { DepositOne } from '@/pages/Admin/DepositOne';
import { ChangePasswordAll } from '@/pages/Admin/ChangePasswordAll';
import { ChangePasswordOne } from '@/pages/Admin/ChangePasswordOne';
import { CryptoRatesPage } from '@/pages/Admin/CryptoRatesPage';
import { QuestionToSupportPage } from '@/pages/Admin/QuestionToSupport';
import { DepositProlongationAll } from '@/pages/Admin/DepositProlongationAll';
import { DepositProlongationOne } from '@/pages/Admin/DepositProlongationOne';


import { EnterPage } from '@/pages/EnterPage/EnterPage';

import { MyAccountMainPage } from '@/pages/MyAccount/MyAccountMainPage';
import { AboutPage } from '@/pages/MyAccount/About';
import { FaqPage } from '@/pages/MyAccount/FAQ';
import { SupportPage } from '@/pages/MyAccount/Support';

import { MainStatPage } from '@/pages/Statistics/MainStatPage';
import { BtcStatPage } from '@/pages/Statistics/BtcStatPage';
import { DepositStatPage } from '@/pages/Statistics/DepositStatPage';




interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element; 
}

export const routes: Route[] = [
  { path: '/', Component: EnterPage },
  { path: '/index', Component: IndexPage },
  { path: '/detailed_deposit/:depositId', Component: DetailedDepositPage },


  { path: '/setpassword', Component: SetPasswordPage },
  { path: '/enterpassword', Component: EnterPasswordPage },
  
  { path: '/createdeposit', Component: CreateDepositPage },
  { path: '/depositrqstdone', Component: DepositRqstDone },
  
  { path: '/mainadmin', Component: MainAdminPage },
  { path: '/adminenter', Component: AdminEnterPage },
  { path: '/usersall', Component: UsersAll },
  { path: '/depositrqstall', Component: DepositRqstAll },
  { path: '/depositrqstone/:requestId', Component: DepositRqstOne },
  { path: '/depositone/:depositId', Component: DepositOne },
  { path: '/changepasswordall', Component: ChangePasswordAll },
  { path: '/changepasswordone/:requestId', Component: ChangePasswordOne },
  { path: '/cryptorates', Component: CryptoRatesPage },
  { path: '/questiontosupport', Component: QuestionToSupportPage },
  { path: '/depositprolongationall', Component: DepositProlongationAll },
  { path: '/depositprolongationone/:prolongationId', Component: DepositProlongationOne },

  { path: '/changepasswordone/:requestId', Component: ChangePasswordOne },
  
  { path: '/mainstat_page', Component: MainStatPage },
  { path: '/btcstat_page', Component: BtcStatPage },
  { path: '/depositstat_page', Component: DepositStatPage },

  { path: '/myaccount-main_page', Component: MyAccountMainPage },
  { path: '/aboutcompany_page', Component: AboutPage },
  { path: '/faq_page', Component: FaqPage },
  { path: '/support_page', Component: SupportPage },
  
  
];
