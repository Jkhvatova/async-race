import { EngineState, startStopApiEngine } from '../../model/api';

type State = { animationID?: number };
export const animationState: State = {};
export const animateCar = (car: HTMLElement, animationTime?: number) => {
  if (car instanceof HTMLElement) {
    const element: HTMLElement = car.querySelector('.car_image') as HTMLElement;
    const CTRL_BTN_WIDTH = 70;
    let start: number;
    let previousTimeStamp: number;
    let done: boolean = false;
    const distance = car.clientWidth - element.clientWidth - CTRL_BTN_WIDTH;

    function step(timestamp: number) {
      // from MDN
      if (!start) {
        start = timestamp;
      }
      if (animationTime) {
        const runtime = timestamp - start;
        let progress = runtime / animationTime;

        if (previousTimeStamp !== timestamp) {
          progress = Math.min(progress, 1);
          element.style.transform = `translateX(${progress * distance}px)`;
          if (progress === distance) done = true;
        }
        if (runtime < animationTime) {
          previousTimeStamp = timestamp;
        }
        if (!done) {
          /// window.requestAnimationFrame(step);
          animationState.animationID = window.requestAnimationFrame(step);
        }
      }
    }
    window.requestAnimationFrame(step);
    return animationState;
  }
};

export const stopCarAnimation = async (id: number, car: HTMLElement) => {
  await startStopApiEngine(id, EngineState.STOP);
  window.cancelAnimationFrame(animationState.animationID as number);
};
