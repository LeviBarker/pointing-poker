import { Component } from "@angular/core";
import { TrophyService } from "@app/services/trophy.service";

@Component({
    selector: 'app-room',
    template: `
  <div style="padding: 16px">
  <button mat-button [routerLink]="['/']">Back</button>
  <h2>Trophy Case</h2>
  <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; justify-content: flex-start;">
  <div *ngFor="let trophy of trophies$ | async" style="height: 72px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 8px">
    <img [src]="trophy['url']" height="56" />
    <small>{{trophy['date']?.seconds | date}}</small>
  </div>
  </div>
  
</div>
  `,
})
export class TrophyCaseComponent {

    trophies$ = this.trophyService.getAllTrophies();

    constructor(private trophyService: TrophyService) {

    }
}