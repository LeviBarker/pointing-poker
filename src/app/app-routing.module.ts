import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoomComponent } from './routes/room/room.component';
import { HomeComponent } from './routes/home/home.component';
import { TrophyCaseComponent } from './routes/trophy-case/trophy-case.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'room/:roomId',
    component: RoomComponent,
  },
  {
    path: 'trophy-case',
    component: TrophyCaseComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
