import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';

import PersonIcon from '@mui/icons-material/Person';
// import GridViewIcon from '@mui/icons-material/GridView';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import Inventory2Icon from '@mui/icons-material/Inventory2';

import WorkIcon from '@mui/icons-material/Work';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

import { ROUTES } from '@/constants/routes.ts';
import './TabbarMenu.css';

export const TabbarMenu: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = useMemo(
    () => [
      { id: 1, Icon: WorkIcon, path: ROUTES.INDEX },
      { id: 2, Icon: AddCircleIcon, path: ROUTES.CREATEDEPOSIT},
      { id: 3, Icon: LeaderboardIcon, path: ROUTES.STATISTICS },
      { id: 4, Icon: PersonIcon, path: ROUTES.MY_ACCOUNT },
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
