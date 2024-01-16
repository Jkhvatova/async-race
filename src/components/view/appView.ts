import GarageView from './garage/garageView';
import { createElement } from '../model/utils';
import WinnersView from './winners/winnersView';
import Car from './car/car';

export default class AppView {
  car: Car;

  constructor() {
    this.car = new Car();
  }

  public static async renderApp(): Promise<void> {
    const FIRST_PAGE = 1;
    const container: HTMLElement = createElement(document.body, 'div', {
      className: 'container',
    });
    const btnRow: HTMLElement = createElement(container, 'div', {
      className: 'buttons-row',
    });
    createElement(btnRow, 'button', {
      className: 'btn',
      id: 'garage',
      textContent: 'to garage',
    });
    createElement(btnRow, 'button', {
      className: 'btn',
      id: 'winners',
      textContent: 'to winners',
    });
    const garagePage: HTMLElement = createElement(container, 'div', {
      className: 'garage-page',
      innerHTML: GarageView.createMenu(),
    });
    const winnersPage: HTMLElement = createElement(container, 'div', {
      className: 'winners-page hide',
    });
    const winnersContent: HTMLElement = createElement(winnersPage, 'div', {
      className: 'winners-content',
      innerHTML: await WinnersView.createView(FIRST_PAGE),
    });
    winnersPage.innerHTML += WinnersView.createPagination();
    btnRow.addEventListener('click', (e) => {
      if (e.target instanceof Element) {
        if (e.target.id === 'garage') {
          winnersPage.classList.add('hide');
          garagePage.classList.remove('hide');
        } else if (e.target.id === 'winners') {
          winnersPage.classList.remove('hide');
          garagePage.classList.add('hide');
        }
      }
    });
    const garageList = createElement(garagePage, 'div', {
      className: 'garage-list',
      innerHTML: (await GarageView.createView(FIRST_PAGE)).join(''),
    });
    garagePage.innerHTML += GarageView.createPagination();
    GarageView.createCar();
    GarageView.removeCar();
    GarageView.updateCar();
    GarageView.generateCars();
    Car.controlCar();
    GarageView.raceCars();
    GarageView.resetCars();
    GarageView.changePage();
    WinnersView.changePage();
    WinnersView.sortBy();
  }
}
