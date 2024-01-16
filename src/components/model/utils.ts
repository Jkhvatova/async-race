import Car from '../view/car/car';
import GarageView from '../view/garage/garageView';
import WinnersView from '../view/winners/winnersView';
import { getCar, getWinner } from './api';
import { СarName } from './carModels';

type CreateElement = (
  parent: HTMLElement,
  childType: string,
  params: Record<string, string>,
) => HTMLElement;

export const createElement: CreateElement = (parent, childType, params) => {
  const child: HTMLElement = parent.appendChild(document.createElement(childType));
  if (params) {
    Object.assign(child, params);
  }
  return child;
};
export const getRandomName = (num: number): number => Math.floor(Math.random() * num);
export const getRandomColor = (): string => `#${Math.floor(Math.random() * 16777215).toString(16)}`; // idea from from css-tricks
export const generateCarName = (brands: СarName[], models: СarName[]): string => {
  const brand = brands[getRandomName(brands.length)];
  const model = models[getRandomName(brands.length)];
  const name = `${brand} ${model}`;
  return name;
};
// winner's popup
export const showPopup = async (id: number, time: number) => {
  const car = await getCar(id);
  //const winner = await getWinner(id);
  const text = `<h2 class="modal-text">winner is: ${car.name} in ${convertToSeconds(
    time,
  )} seconds!</h2>`;
  const overlay = createElement(document.body, 'div', {
    className: 'overlay',
  });
  createElement(overlay, 'div', {
    className: 'modal',
    innerHTML: text,
  });
  overlay.addEventListener('click', () => {
    overlay.remove();
  });
};
// convert to sec
export const convertToSeconds = (time: number): string => {
  const SECONDS = 0.001;
  return (time * SECONDS).toFixed(2);
};

export const disableBtn = (btn: HTMLButtonElement) => {
  btn.classList.add('btn-disabled');
  btn.disabled = true;
};
export const enableBtn = (btn: HTMLButtonElement) => {
  btn.classList.remove('btn-disabled');
  btn.disabled = false;
};
export const sortAsc = (a: number, b: number) => a - b;
export const sortDesc = (a: number, b: number) => b - a;
