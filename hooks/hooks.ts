// // app/hooks/hooks.ts
// import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// import type { RootState, AppDispatch } from '../app/reduxStore/store/store';

// export const useAppDispatch: () => AppDispatch = useDispatch;
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/reduxStore/store/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;