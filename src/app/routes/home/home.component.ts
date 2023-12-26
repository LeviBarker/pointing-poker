import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {RoomService} from "@app/services/room.service";
import {RemoteConfigService} from "@app/services/remote-config.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  roomTitle: string = '';
  cardOptions: string = '1,2,3,4,5,6,7,8,9,10';
  possibleCardOptions: string[] = [];
  creatingRoom: boolean = false;

  constructor(private roomService: RoomService, private router: Router, private remoteConfigService: RemoteConfigService) {
  }

  async ngOnInit() {
    this.possibleCardOptions = this.remoteConfigService
      .getValue('card_options')
      .asString()
      ?.replaceAll('"', '')
      .split(':') || [];
  }

  async createRoom() {
    this.creatingRoom = true;
    const roomDoc = await this.roomService.createRoom(this.roomTitle, this.cardOptions);
    await this.router.navigate([`/room/${roomDoc.id}`]);
  }
}
