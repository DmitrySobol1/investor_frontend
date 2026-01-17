import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';

import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import LockResetIcon from '@mui/icons-material/LockReset';

import { ROUTES } from '@/constants/routes.ts';
import '../TabbarMenu/TabbarMenu.css';

export const AdminTabbarMenu: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = useMemo(
    () => [
      { id: 1, Icon: HomeIcon, path: ROUTES.ADMIN_MAIN },
      { id: 2, Icon: PeopleIcon, path: ROUTES.ADMIN_USERS },
      { id: 3, Icon: WorkIcon, path: ROUTES.ADMIN_DEPOSIT_RQST },
      { id: 4, Icon: LockResetIcon, path: ROUTES.ADMIN_CHANGE_PASSWORD },
    ],
    [] 
  );

  const getInitialTab = useCallback(() => {
    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    return currentTab ? currentTab.id : tabs[0].id;
  }, [tabs, location.pathname]);

  const [currentTab, setCurrentTab] = useState(getInitialTab());

  useEffect(() => {
    const current = tabs.find((tab) => tab.path === location.pathname);
    if (current) {
      setCurrentTab(current.id);
    }
  }, [location.pathname, tabs]);

  const changePage = useCallback(
    (id: number) => {
      const tab = tabs.find((t) => t.id === id);
      if (tab) {
        setCurrentTab(id);
        navigate(tab.path);
      }
    },
    [tabs, navigate]
  );

  return (
    <nav className="custom-tabbar">
      {tabs.map(({ id, Icon }) => (
        <div
          key={id}
          className={`custom-tabbar__item ${
            id === currentTab ? 'custom-tabbar__item--active' : ''
          }`}
          onClick={() => changePage(id)}
        >
          <Icon className="custom-tabbar__icon" />
        </div>
      ))}
    </nav>
  );
};
