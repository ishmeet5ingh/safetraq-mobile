import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppDispatch } from './src/hooks/redux';
import { store } from './src/store';
import { restoreSessionThunk } from './src/store/slices/authSlice';
import { fetchActiveSessionThunk } from './src/store/slices/sessionsSlice';

const Bootstrap = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const run = async (): Promise<void> => {
      const result = await dispatch(restoreSessionThunk());

      if (restoreSessionThunk.fulfilled.match(result) && result.payload?.token) {
        await dispatch(fetchActiveSessionThunk());
      }
    };

    void run();
  }, [dispatch]);

  return <AppNavigator />;
};

const App = () => {
  return (
    <Provider store={store}>
      <Bootstrap />
    </Provider>
  );
};

export default App;
