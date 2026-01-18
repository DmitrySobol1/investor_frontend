// import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { initData , useSignal } from '@tma.js/sdk-react';

export const useTlgid = () => {
  const user = useSignal(initData.user);
  const tlgid = user?.id;
  const username = user?.username;
  return { tlgid, username };
};