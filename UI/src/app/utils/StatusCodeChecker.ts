import { environment } from '../../environments/environment';

export function statusCodeChecker(statusCode: number) {
  if (statusCode === 401) {
    window.location.href = environment.oauth2login;
    throw new Error('Not authenticated');
  }

  if (statusCode === 403) {
    alert(
      'Vous ne disposez pas des droits nécessaires pour accéder à ces ressources.'
    );
    window.location.href = environment.mainPage;
    throw new Error('Not Authorized');
  }
}
