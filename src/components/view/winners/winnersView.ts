import { reloadApp, state, updateState } from '../../controller/state';
import { WINNERS_LIMIT, WinnersListResponse, getCar, getWinners } from '../../model/api';
import { convertToSeconds, disableBtn, enableBtn } from '../../model/utils';
import Car from '../car/car';

export default class WinnersView {
  public static async createView(page?: number): Promise<string> {
    let content: string = '';
    const [winnersFromServer, total] = await getWinners(page);
    const winnersList = await winnersFromServer;
    let counter = 1;
    await Promise.all(
      winnersList.map(async (item) => {
        const winner = await getCar(item.id);
        content += `<tr>
        <td>${counter}</td>
        <td>${Car.renderCarImage(winner.color)}</td>
        <td>${winner.name}</td>
        <td>${item.wins}</td>
        <td>${convertToSeconds(item.time)}</td>
      </tr>`;
        counter += 1;
        return content;
      }),
    );
    return `<h2>WINNERS</h2>
    <h3 class="page-number" data-winpage="${page}">Page: (${page})</h3>
    ${WinnersView.createTableHeader()}
    ${content}
    </table>`;
  }

  public static createTableHeader = () => `<table>
  <tr>
  <th>N</th>
  <th>Image of the car</th>
  <th>Name of the car</th>
  <th class='wins'>Wins number</th>
  <th class='time'>Best time in seconds</th>
</tr>`;

  public static async reloadWinners(
    winnersList: WinnersListResponse,
    page: number,
  ): Promise<string> {
    let content: string = '';
    let counter = 1;
    await Promise.all(
      winnersList.map(async (item) => {
        const winner = await getCar(item.id);
        content += `<tr>
        <td>${counter}</td>
        <td>${Car.renderCarImage(winner.color)}</td>
        <td>${winner.name}</td>
        <td>${item.wins}</td>
        <td>${convertToSeconds(item.time)}</td>
      </tr>`;
        counter += 1;
        return content;
      }),
    );
    return `<h2>WINNERS</h2>
    <h3 class="page-number" data-winpage="${page}">Page: (${page})</h3>
    ${WinnersView.createTableHeader()}
    ${content}
    </table>`;
  }

  public static createPagination() {
    return `<div class="pagination">
    <button class="btn prev">previous</button><button class="btn next">next</button></div>`;
  }

  public static changePage(pageNumber?: number): void {
    const winnersPage: HTMLElement = document.querySelector('.winners-page') as HTMLElement;
    const winnersContent: HTMLElement = document.querySelector('.winners-content') as HTMLElement;
    const prevBtn: HTMLButtonElement = winnersPage.querySelector('.prev') as HTMLButtonElement;
    const nextBtn: HTMLButtonElement = winnersPage.querySelector('.next') as HTMLButtonElement;
    const page: HTMLElement = winnersPage.querySelector('.page-number') as HTMLElement;
    let currentPageNumber = Number(page.dataset.winpage);
    if (currentPageNumber === 1) disableBtn(prevBtn);
    prevBtn.addEventListener('click', async () => {
      currentPageNumber -= 1;
      if (currentPageNumber < 1) {
        currentPageNumber = 1;
        disableBtn(prevBtn);
      }
      enableBtn(nextBtn);
      const content = await this.createView(currentPageNumber);
      winnersContent.innerHTML = '';
      winnersContent.innerHTML = content;
    });
    nextBtn.addEventListener('click', async () => {
      const [winners, total] = await getWinners();
      const pages = Math.ceil(total / WINNERS_LIMIT);
      currentPageNumber += 1;
      enableBtn(prevBtn);

      if (currentPageNumber > pages) {
        currentPageNumber = pages;
        disableBtn(nextBtn);
      }
      const content = await this.createView(currentPageNumber);
      winnersContent.innerHTML = '';
      winnersContent.innerHTML = content;
    });
  }
  public static async sortWinsAsc(
    winnersList: WinnersListResponse,
    page: number,
    winnersContent: HTMLElement,
  ): Promise<void> {
    const winnersSorted = winnersList.sort((a, b) => (+a.wins > +b.wins ? 1 : -1));
    winnersContent.innerHTML = '';
    winnersContent.innerHTML = await this.reloadWinners(winnersList, page);
  }
  public static async sortTimeAsc(
    winnersList: WinnersListResponse,
    page: number,
    winnersContent: HTMLElement,
  ): Promise<void> {
    const winnersSorted = winnersList.sort((a, b) => (+a.time > +b.time ? 1 : -1));
    winnersContent.innerHTML = '';
    winnersContent.innerHTML = await this.reloadWinners(winnersList, page);
  }
  public static async sortBy() {
    const winnersContent: HTMLElement = document.querySelector('.winners-content') as HTMLElement;
    const [winnersFromServer, total] = await getWinners();
    const winnersList = await winnersFromServer;
    const winsBtn: HTMLElement = document.querySelector('.wins') as HTMLElement;
    const timeBtn: HTMLElement = document.querySelector('.time') as HTMLElement;
    const winnersPage: HTMLElement = document.querySelector('.winners-page') as HTMLElement;
    const page: HTMLElement = winnersPage.querySelector('.page-number') as HTMLElement;
    let currentPageNumber = Number(page.dataset.winpage);

    if (winsBtn instanceof HTMLElement) {
      winsBtn.addEventListener('click', async (e) => {
        WinnersView.sortWinsAsc(winnersList, currentPageNumber, winnersContent);
      });
    }
    if (timeBtn instanceof HTMLElement) {
      timeBtn.addEventListener('click', async (e) => {
        WinnersView.sortTimeAsc(winnersList, currentPageNumber, winnersContent);
      });
    }
  }
}
