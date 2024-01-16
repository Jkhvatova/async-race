import { state } from '../../controller/state';
import {
  EngineState,
  createApiWinner,
  driveApiCar,
  getCar,
  getWinner,
  getWinners,
  startStopApiEngine,
  updateApiWinner,
} from '../../model/api';
import { IMAGE_PART01, IMAGE_PART02, IMAGE_PART03 } from '../../model/carImage';
import { convertToSeconds, disableBtn, enableBtn } from '../../model/utils';
import WinnersView from '../winners/winnersView';
import { animateCar, stopCarAnimation, animationState } from './animation';

export default class Car {
  static animation: number;

  public static renderCarImage = (color: string): string => `${IMAGE_PART01}
    ${color}${IMAGE_PART02}${IMAGE_PART03}`;

  public static async renderCar(id: number): Promise<string> {
    const carFromServer = await getCar(id);
    const car = `<div class="car">${carFromServer.name}</div>`;
    return car;
  }

  public static startCar = async (id: number) => {
    const carDriveData = await startStopApiEngine(id, EngineState.START);
    const { velocity, distance } = JSON.parse(JSON.stringify(carDriveData));
    const animationTime = distance / velocity;
    return animationTime;
  };

  public static raceCar = async (id: number) => {
    const animationTime = await this.startCar(id);
    const car: HTMLElement = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
    animateCar(car, animationTime);
    const driveAnswer = await driveApiCar(id);
    if (driveAnswer === 500) {
      stopCarAnimation(id, car);
    }
    return { id: id, time: animationTime };
  };
  public static resetCar = async (id: number, car: HTMLElement) => {
    await startStopApiEngine(id, EngineState.STOP);
    if (car instanceof HTMLElement) {
      const element: HTMLElement = car.querySelector('.car_image') as HTMLElement;
      window.cancelAnimationFrame(animationState.animationID as number);
      element.style.transform = 'translateX(0px)';
    }
  };
  public static controlCar() {
    const renderedCars = document.querySelector('.garage-page');
    const btnA: HTMLButtonElement = document.querySelector('.car_A-btn') as HTMLButtonElement;
    const btnB: HTMLButtonElement = document.querySelector('.car_B-btn') as HTMLButtonElement;

    if (renderedCars) {
      renderedCars.addEventListener('click', async (e) => {
        if (e.target instanceof Element && e.target.classList.contains('car_A-btn')) {
          const car = e.target.closest('.car') as HTMLElement;
          const btnA: HTMLButtonElement = car.querySelector('.car_A-btn') as HTMLButtonElement;
          const btnB: HTMLButtonElement = car.querySelector('.car_B-btn') as HTMLButtonElement;
          disableBtn(btnA);
          enableBtn(btnB);
          const carId: number = Number(car.dataset.id);
          const animationTime = await this.startCar(carId);
          animateCar(car, animationTime);
          const driveAnswer = await driveApiCar(carId);
          if (driveAnswer === 500) {
            stopCarAnimation(carId, car);
            disableBtn(btnB);
            enableBtn(btnA);
          }
        } else if (e.target instanceof Element && e.target.classList.contains('car_B-btn')) {
          const car = e.target.closest('.car') as HTMLElement;
          const carId: number = Number(car.dataset.id);
          const btnA: HTMLButtonElement = car.querySelector('.car_A-btn') as HTMLButtonElement;
          const btnB: HTMLButtonElement = car.querySelector('.car_B-btn') as HTMLButtonElement;
          this.resetCar(carId, car);
          disableBtn(btnB);
          enableBtn(btnA);
        }
      });
    }
  }

  public static async addWinner(id: number, time: number) {
    let currentTime = Number(time);
    console.log('time ' + currentTime);
    const [winners, total] = await getWinners();
    const isWinner = (await winners).some((winner) => winner.id === id);
    if (!isWinner) {
      await createApiWinner({ id, wins: 1, time: currentTime });
    } else {
      const winner = await getWinner(id);
      winner.wins += 1;
      if (currentTime < winner.time) {
        winner.time = currentTime;
      }
      console.log(winner);
      await updateApiWinner(id, { wins: winner.wins, time: winner.time });
    }
  }
}
