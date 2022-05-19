import { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import './App.scss';
import { defaultGlobalState, GlobalContext, IUser, Localization } from '../../provider/provider';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import EditProfile from '../EditProfile/EditProfile';
import SignIn from '../SignIn/SignIn';
import SignUp from '../SignUp/SignUp';
import Welcome from '../Welcome/Welcome';
import Main from '../Main/Main';
import { PATH } from '../../constants/paths';
import theme from '../../constants/theme';
import { Board } from '../Board/board';
import { localizationContent } from '../../localization/types';
import { IBoard } from '../../constants/interfaces';

function App() {
  const [userState, setUserState] = useState<IUser>(defaultGlobalState.userState);
  const defaultInterfaceLanguage = localizationContent.getLanguage();
  const [localization, setLocalization] = useState(
    defaultInterfaceLanguage === 'ru-RU' ? Localization.ru : Localization.en
  );
  const [isCreateNewBoardOpen, setIsCreateNewBoardOpen] = useState(false);
  const [boardsArray, setBoardsArray] = useState<IBoard[]>([]);
  const [stickyHeader, setStickyHeader] = useState(false);

  const scrollHandler = () => {
    if (window.scrollY >= 5) {
      setStickyHeader(true);
      console.log('scroll', window.scrollY);
    } else {
      setStickyHeader(false);
      console.log('***');
    }
  };

  window.addEventListener('scroll', scrollHandler);

  return (
    <div className="app">
      <ThemeProvider theme={theme}>
        <GlobalContext.Provider
          value={{
            userState,
            setUserState,
            localization,
            setLocalization,
            isCreateNewBoardOpen,
            setIsCreateNewBoardOpen,
            boardsArray,
            setBoardsArray,
            stickyHeader,
            setStickyHeader,
          }}
        >
          <Router>
            <Routes>
              <Route path={PATH.BASE_URL} element={<Welcome />} />
              <Route path={PATH.MAIN_ROUTE} element={<Main />} />
              <Route path={PATH.BOARD} element={<Board />} />
              <Route path={PATH.SIGN_IN} element={<SignIn />} />
              <Route path={PATH.SIGN_UP} element={<SignUp />} />

              <Route path={PATH.ERROR_PAGE} element={<NotFoundPage />} />
              <Route path={PATH.EDIT_PROFILE} element={<EditProfile />} />
            </Routes>
          </Router>
        </GlobalContext.Provider>
      </ThemeProvider>
    </div>
  );
}

export default App;
