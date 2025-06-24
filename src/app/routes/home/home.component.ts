import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {RoomService} from "@app/services/room.service";
import {RemoteConfigService} from "@app/services/remote-config.service";
import {Auth, onAuthStateChanged, User} from "@angular/fire/auth";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  roomTitle: string = '';
  cardOptions: string = '1,2,3,5,8,13,21';
  possibleCardOptions: string[] = [];
  creatingRoom: boolean = false;
  currentUser: User | null = null;
  roomPasscode: string | null = null;
  private userHasLoaded: boolean = false;
  showPasscode: boolean = false;

  constructor(private auth: Auth, private roomService: RoomService, private router: Router, private remoteConfigService: RemoteConfigService) {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.userHasLoaded = true;
    });
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
    const roomDoc = await this.roomService.createRoom(this.roomTitle, this.cardOptions, this.currentUser?.uid, this.roomPasscode);
    await this.router.navigate([`/room/${roomDoc.id}`]);
  }
}
