import { reloadApp, state, updateState } from '../../controller/state';
import {
  CARS_LIMIT,
  SingleCarResponse,
  addNewCar,
  deleteApiCar,
  deleteApiWinner,
  generateNewCars,
  getCar,
  getCars,
  getWinner,
  getWinners,
  updateApiCar,
  updateApiWinner,
} from '../../model/api';
import { disableBtn, enableBtn, showPopup } from '../../model/utils';
import Car from '../car/car';

export default class GarageView {
  car: Car;

  constructor() {
    this.car = new Car();
  }

  public static createMenu(): string {
    return `<div class="menu">
    <div class="form">
      <form action="" id="create-car">
        <input type="text" id="create-car-name" name="car-name"><br>
        <input type="color" id="create-car-color" name="car-color" value="#ffffff">
        <input type="submit" value="create" class="btn create-btn">
      </form>
    </div>
    <div class="form">
      <form action="" id="update-car">
        <input type="text" id="update-car-name" name="car-name"><br>
        <input type="color" id="update-car-color" name="car-color" value="#ffffff">
        <input type="submit" value="update" class="btn update-btn btn-disabled" disabled>
      </form>
    </div>
    <div class="buttons">
      <button class="btn race-btn">race</button>
      <button class="btn reset-btn btn-disabled" disabled>reset</button>
      <button class="btn generate-btn">generate cars</button>
    </div>
  </div>`;
  }
  public static async reloadGarage() {
    const page: HTMLElement = document.querySelector('.page-number') as HTMLElement;
    let currentPageNumber = Number(page.dataset.page);
    updateState(currentPageNumber);
    reloadApp(state);
  }
  public static async createCar(): Promise<void> {
    const createForm = document.getElementById('create-car');
    const inputName: HTMLInputElement = document.getElementById(
      'create-car-name',
    ) as HTMLInputElement;
    const inputColor: HTMLInputElement = document.getElementById(
      'create-car-color',
    ) as HTMLInputElement;
    if (createForm instanceof Element) {
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newCar = await addNewCar({
          name: inputName.value,
          color: inputColor.value,
        });
        GarageView.reloadGarage();
      });
    }
  }

  public static async removeCar() {
    const renderedCars = document.querySelector('.garage-page');
    if (renderedCars) {
      renderedCars.addEventListener('click', async (e) => {
        if (e.target instanceof Element && e.target.classList.contains('car_remove-btn')) {
          const car = e.target.closest('.car') as HTMLElement;
          const carId: number = Number(car.dataset.id);
          deleteApiCar(carId);
          const [winners, total] = await getWinners();
          const isWinner = (await winners).some((winner) => winner.id === carId);
          if (isWinner) deleteApiWinner(carId);
          GarageView.reloadGarage();
        }
      });
    }
  }

  public static updateCar() {
    const renderedCars = document.querySelector('.garage-page');
    const updateForm = document.getElementById('update-car');
    let apiCar: SingleCarResponse;
    const inputName: HTMLInputElement = document.getElementById(
      'update-car-name',
    ) as HTMLInputElement;
    const inputColor: HTMLInputElement = document.getElementById(
      'update-car-color',
    ) as HTMLInputElement;
    const updateBtn: HTMLButtonElement = document.querySelector('.update-btn') as HTMLButtonElement;
    if (renderedCars) {
      renderedCars.addEventListener('click', async (e) => {
        if (e.target instanceof Element && e.target.classList.contains('car_select-btn')) {
          const car = e.target.closest('.car') as HTMLElement;
          const carId: number = Number(car.dataset.id);
          apiCar = await getCar(carId);
          inputName.value = apiCar.name;
          inputColor.value = apiCar.color;

          enableBtn(updateBtn);
        }
      });
    }
    if (updateForm instanceof Element) {
      updateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        updateApiCar(apiCar.id, {
          name: inputName.value,
          color: inputColor.value,
        });
        disableBtn(updateBtn);
        GarageView.reloadGarage();
      });
    }
  }

  public static async generateCars() {
    const generateBtn: HTMLElement = document.querySelector('.generate-btn') as HTMLElement;
    if (generateBtn instanceof HTMLElement) {
      generateBtn.addEventListener('click', async () => {
        const page: HTMLElement = document.querySelector('.page-number') as HTMLElement;
        let currentPageNumber = Number(page.dataset.page);
        await generateNewCars();
        const [cars, total] = await getCars(currentPageNumber);
        GarageView.reloadGarage();
      });
    }
  }

  public static async raceCars() {
    const raceBtn: HTMLButtonElement = document.querySelector('.race-btn') as HTMLButtonElement;
    const resetBtn: HTMLButtonElement = document.querySelector('.reset-btn') as HTMLButtonElement;
    raceBtn.addEventListener('click', () => {
      const renderedCars: NodeListOf<HTMLElement> = document.querySelectorAll('.car');
      disableBtn(raceBtn);
      disableBtn(resetBtn);
      const carsToRace = Array.from(renderedCars).map((car) =>
        Car.raceCar(Number(car.getAttribute('data-id'))),
      );
      Promise.race(carsToRace)
        .then((winner) => {
          Car.addWinner(winner.id, winner.time);
          showPopup(winner.id, winner.time);
        })
        .then(() => {
          enableBtn(resetBtn);
        });
    });
  }
  public static async resetCars() {
    const resetBtn: HTMLButtonElement = document.querySelector('.reset-btn') as HTMLButtonElement;
    const raceBtn: HTMLButtonElement = document.querySelector('.race-btn') as HTMLButtonElement;

    resetBtn.addEventListener('click', () => {
      const renderedCars: NodeListOf<HTMLElement> = document.querySelectorAll('.car');
      const carsToReset = Array.from(renderedCars).map((car) =>
        Car.resetCar(Number(car.getAttribute('data-id')), car),
      );
      Promise.all(carsToReset).then(() => {
        enableBtn(raceBtn);
        disableBtn(resetBtn);
      });
      GarageView.reloadGarage();
    });
  }
  public static createGarageTitle(page: number, totalCars: number): string {
    return `<div class="garage-title"><h2>Garage: (${totalCars})</h2></div>
    <div class="garage-page"><h3 class="page-number" data-page="${page}">Page: (${page})</h3></div>`;
  }

  public static async createView(page: number): Promise<string[]> {
    const [carsFromServer, totalCars] = await getCars(page, CARS_LIMIT);
    let renderedCars = '';
    const totalCountString = GarageView.createGarageTitle(page, totalCars);
    (await carsFromServer).forEach((car) => {
      const carImage = Car.renderCarImage(car.color);
      renderedCars += `
      <div class="car" data-id="${car.id}">
      <div class="car_header">
      <button class="btn car_select-btn">select</button>
      <button class="btn car_remove-btn">remove</button>
      <div class="car_name">${car.name}</div>
      </div>
      <div class="car_track">
      <button class="btn car_A-btn">A</button>
      <button class="btn car_B-btn btn-disabled" disabled>B</button>
        <div class="car_image">${carImage}</div>
        <div class="car_flag"><img src='../../../assets/flag.svg' /></div>
        </div>
        <hr>
        </div>`;
    });

    return [totalCountString, renderedCars];
  }
  public static createPagination() {
    return `<div class="pagination">
    <button class="btn prev">previous</button><button class="btn next">next</button></div>`;
  }
  public static changePage(pageNumber?: number): void {
    const garageList: HTMLElement = document.querySelector('.garage-list') as HTMLElement;
    const prevBtn: HTMLButtonElement = document.querySelector('.prev') as HTMLButtonElement;
    const nextBtn: HTMLButtonElement = document.querySelector('.next') as HTMLButtonElement;
    const page: HTMLElement = document.querySelector('.page-number') as HTMLElement;
    let currentPageNumber = Number(page.dataset.page);
    if (currentPageNumber === 1) disableBtn(prevBtn);
    prevBtn.addEventListener('click', async () => {
      currentPageNumber -= 1;
      if (currentPageNumber < 1) {
        currentPageNumber = 1;
        disableBtn(prevBtn);
      }
      enableBtn(nextBtn);
      const content = (await GarageView.createView(currentPageNumber)).join('');
      garageList.innerHTML = '';
      garageList.innerHTML = content;
    });
    nextBtn.addEventListener('click', async () => {
      const [cars, total] = await getCars();
      const pages = Math.ceil(total / CARS_LIMIT);
      currentPageNumber += 1;
      enableBtn(prevBtn);

      if (currentPageNumber > pages) {
        currentPageNumber = pages;
        disableBtn(nextBtn);
      }
      const content = (await GarageView.createView(currentPageNumber)).join('');
      garageList.innerHTML = '';
      garageList.innerHTML = content;
    });
  }
}
