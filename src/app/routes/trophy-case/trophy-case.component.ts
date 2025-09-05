import { Component } from "@angular/core";
import { TrophyService } from "@app/services/trophy.service";

@Component({
    selector: 'app-room',
    template: `
  <div style="padding: 16px; height: calc(100vh - 96px); overflow-y: auto;">
  <button mat-button [routerLink]="['/']">Back</button>
  <h2>Trophy Case</h2>
  <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; justify-content: flex-start;">
  <div *ngFor="let trophy of trophies$ | async" style="height: 156px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 8px; max-width: 156px">
    <img [src]="trophy['url']" />
    <small>Seen {{trophy['date']?.seconds * 1000 | date}} by {{trophy['user']}}'s team</small>
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