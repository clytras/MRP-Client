import { Strings } from '@mrplib/i18n/rn';


export function translateFirebaseError({
  error: {
    message: serverMessage,
    details = {}
  } = {}
}) {
  const { code, uid = 0 } = details || {};
  let title = Strings.messages.SomethingWentWrong;
  let message;
  let subMessage;

  switch(code) {
    case 'no-auth-session':
      message = Strings.messages.NoUserAuthorizationFound;
      subMessage = Strings.messages.TryToLoginAgain;
      break;
    case 'no-sys-conf-doc':
      message = Strings.messages.NoSystewConfigurationFound;
      subMessage = Strings.messages.PleaseTryAgain;
      break;
    case 'user-not-found':
      message = Strings.messages.UserNotFound;
      subMessage = Strings.messages.TryToLoginAgain;
      break;
    case 'user-disabled':
      title = Strings.messages.WeAreSorry;
      message = Strings.messages.AccountDeactivated;
      break;
    case 'sys-not-running':
      title = null;
      message = translateSystemStatus(details);
      subMessage = Strings.messages.PleaseTryAgainLater;
      break;
    case 'location-not-supported':
      title = Strings.messages.WeAreSorry;
      message = Strings.messages.YourLocationIsNotSupportedYet;
      break;
    case 'invalid-address':
      message = Strings.messages.InvalidAddress;
      break;
    default:
      message = Strings.messages.ProblemCommunicatingWithMrPengu;
      subMessage = Strings.messages.PleaseTryAgain;
  }

  return {
    code,
    title,
    message,
    subMessage,
    serverMessage
  }
}

export function translateSystemStatus({ status }) {
  switch(status) {
    case 'maintenance': return Strings.messages.SystemTemporarilyMaintenance;
    case 'down':
    default:
      return Strings.messages.SystemTemporarilyAnavailable;
  }
}
