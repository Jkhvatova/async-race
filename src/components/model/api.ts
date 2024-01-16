import { carBrand, carModel } from './carModels';
import { generateCarName, getRandomColor } from './utils';

const baseUrl: string = 'http://localhost:3000';
const path = {
  garage: '/garage',
  engine: '/engine',
  winners: '/winners',
};

// common types and constants

export const CARS_LIMIT = 7;
export const WINNERS_LIMIT = 10;
export interface SingleCarResponse {
  name: string;
  color: string;
  id: number;
}
export type CarsListResponse = SingleCarResponse[];

export interface SingleWinnerResponse {
  id: number;
  wins: number;
  time: number;
}
export type WinnersListResponse = SingleWinnerResponse[];

// car
export const getCar = async (id: number): Promise<SingleCarResponse> => {
  const response = await fetch(`${baseUrl}${path.garage}/${id}`);
  const item = await response.json();
  return item;
};

// garage cars
type GetCarsResponse = Promise<[Promise<CarsListResponse>, number]>;
export const getCars = async (page: number = 1, limit: number = CARS_LIMIT): GetCarsResponse => {
  const response: Response = await fetch(`${baseUrl}${path.garage}?_page=${page}&_limit=${limit}`);
  const cars = await response.json();
  const total: number = Number(response.headers.get('X-Total-Count'));
  return [cars, total];
};

export const addNewCar = async (content: {}): Promise<SingleCarResponse> => {
  const response = await fetch(`${baseUrl}${path.garage}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  const result: SingleCarResponse = await response.json();
  return result;
};

export const updateApiCar = async (id: number, content: {}): Promise<SingleCarResponse> => {
  const response = await fetch(`${baseUrl}${path.garage}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  const result: SingleCarResponse = await response.json();
  return result;
};
export const deleteApiCar = async (id: number): Promise<void> => {
  const response = await fetch(`${baseUrl}${path.garage}/${id}`, {
    method: 'DELETE',
  });
};

// winners
export const getWinner = async (id: number): Promise<SingleWinnerResponse> => {
  const response = await fetch(`${baseUrl}${path.winners}/${id}`);
  const item = await response.json();
  return item;
};
export enum Sort {
  ID = 'id',
  WINS = 'wins',
  TIME = 'time',
}
export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}
export const getWinners = async (
  page: number = 1,
  limit = WINNERS_LIMIT,
  sortBy: Sort = Sort.WINS,
  orderBy: Order = Order.ASC,
): Promise<[Promise<WinnersListResponse>, number]> => {
  const response: Response = await fetch(
    `${baseUrl}${path.winners}?_page=${page}&_limit=${limit}&_order=${sortBy}&_order=${orderBy}`,
  );
  const winners = await response.json();
  const total: number = Number(response.headers.get('X-Total-Count'));
  return [winners, total];
};

export const createApiWinner = async (content: {}): Promise<SingleWinnerResponse> => {
  const response = await fetch(`${baseUrl}${path.winners}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  const result: SingleWinnerResponse = await response.json();
  return result;
};
export const updateApiWinner = async (id: number, content: {}): Promise<SingleWinnerResponse> => {
  const response = await fetch(`${baseUrl}${path.winners}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  const result: SingleWinnerResponse = await response.json();
  return result;
};

export const deleteApiWinner = async (id: number): Promise<Response> => {
  const response = await fetch(`${baseUrl}${path.winners}/${id}`, {
    method: 'DELETE',
  });
  return response;
};

// engine
export enum EngineState {
  START = 'started',
  STOP = 'stopped',
  DRIVE = 'drive',
}
export const startStopApiEngine = async (id: number, status: EngineState): Promise<Response> => {
  const response = await fetch(`${baseUrl}${path.engine}?id=${id}&status=${status}`, {
    method: 'PATCH',
  });
  const driveApiData = await response.json();
  return driveApiData;
};
type DriveResponse = Promise<number | Response>;
export const driveApiCar = async (
  id: number,
  status: EngineState = EngineState.DRIVE,
): DriveResponse => {
  const response = await fetch(`${baseUrl}${path.engine}?id=${id}&status=${status}`, {
    method: 'PATCH',
  }).catch();
  return response.ok ? response.json() : response.status;
};

export const generateNewCars = async () => {
  const carsCount = 100;
  for (let i = 0; i < carsCount; i += 1) {
    addNewCar({
      name: generateCarName(carBrand, carModel),
      color: getRandomColor(),
    });
  }
};
