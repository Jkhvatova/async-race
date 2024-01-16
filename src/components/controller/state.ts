import { CARS_LIMIT, getCars } from '../model/api';
import GarageView from '../view/garage/garageView';
import WinnersView from '../view/winners/winnersView';

export type State = {
  currentGaragePage: number;
  currentWinnersPage: number;
};
export const state: State = {
  currentGaragePage: 1,
  currentWinnersPage: 1,
};

export const updateState = (currentGaragePage: number, currentWinnersPage?: number) => {
  state.currentGaragePage = currentGaragePage as number;
  state.currentWinnersPage = currentWinnersPage as number;
};
export const reloadApp = async (state: State): Promise<void> => {
  const garageList: HTMLElement = document.querySelector('.garage-list') as HTMLElement;
  garageList.innerHTML = '';
  garageList.innerHTML = (await GarageView.createView(state.currentGaragePage)).join('');
  const winnersPage: HTMLElement = document.querySelector('.winners-page') as HTMLElement;
  winnersPage.innerHTML = '';
  winnersPage.innerHTML = await WinnersView.createView(state.currentWinnersPage);
};
