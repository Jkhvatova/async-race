import { CARS_LIMIT, getCars } from '../model/api';
import AppView from '../view/appView';

export default class App {
  public static start(): void {
    AppView.renderApp();
    getCars(1, CARS_LIMIT);
  }
}
