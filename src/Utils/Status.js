import {useIsFocused} from '@react-navigation/native';
let status = [];
export default (
  reducerStatus,
  Action_Request,
  successAction = () => {},
  faild = () => {},
  request = () => {},
) => {
  const isFocusedNow = useIsFocused();
  if (!status) {
    status = [];
  }

  if (
    isFocusedNow &&
    status.findIndex(itemStatus => itemStatus == reducerStatus) == -1
  ) {
    if (reducerStatus === '' || reducerStatus !== status) {
      const REQUEST = Action_Request;
      const SUCCESS =
        new String(Action_Request).substr(0, Action_Request.length - 7) +
        'SUCCESS';
      const FAILD =
        new String(Action_Request).substr(0, Action_Request.length - 7) +
        'FAILURE';

      const statusText = new String(REQUEST).substr(0, REQUEST.length - 7);

      const statusIndexRequest = status.findIndex(
        itemStatus => itemStatus == REQUEST,
      );
      const statusIndexSuccess = status.findIndex(
        itemStatus => itemStatus == SUCCESS,
      );
      const statusIndexFaild = status.findIndex(
        itemStatus => itemStatus == FAILD,
      );
      const statusIndexItem = status.findIndex(itemStatus =>
        new String(itemStatus).startsWith(statusText),
      );

      switch (reducerStatus) {
        case REQUEST:
          if (statusIndexRequest == -1) {
            statusIndexItem == -1
              ? status.push(reducerStatus)
              : (status[statusIndexItem] = reducerStatus);
            typeof request == 'function' ? request() : null;
          }
          break;

        case SUCCESS:
          if (statusIndexRequest != -1 && statusIndexSuccess == -1) {
            statusIndexItem == -1
              ? status.push(reducerStatus)
              : (status[statusIndexItem] = reducerStatus);
            typeof successAction == 'function' && status?.length != 0
              ? successAction()
              : null;
          }
          break;

        case FAILD:
          if (statusIndexRequest != -1 && statusIndexFaild == -1) {
            statusIndexItem == -1
              ? status.push(reducerStatus)
              : (status[statusIndexItem] = reducerStatus);
            typeof faild == 'function' && status?.length != 0 ? faild() : null;
          }
          break;
      }
    }
  }
};
