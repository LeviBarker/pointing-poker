import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent {

  @Input() vote: any;

  @Input() showVotes: boolean = false;

  @Input() isCurrentUser: boolean = false;

}
