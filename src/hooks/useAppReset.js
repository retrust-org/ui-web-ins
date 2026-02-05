// hooks/useAppStateReset.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetAppState } from "../redux/store";

const useAppStateReset = (appType, options = {}) => {
  const dispatch = useDispatch();
  const { resetOnMount = true } = options;
    const currentAppType = useSelector((state) => state.appState.currentAppType);
    
  useEffect(() => {
    if (resetOnMount && currentAppType !== appType) {
      dispatch(resetAppState(appType));
    }
  }, [appType, currentAppType, dispatch, resetOnMount]);

  const resetStates = () => {
    dispatch(resetAppState(appType));
  };

  return { resetStates, currentAppType };
};

export default useAppStateReset;
