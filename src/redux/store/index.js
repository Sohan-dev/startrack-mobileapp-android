import {createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {logger} from 'redux-logger';
import rootSaga from '../../redux-saga/RootSaga';
import rootReducer from '../reducer/RootReducer';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware, logger));
sagaMiddleware.run(rootSaga);

export default store;
