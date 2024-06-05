import {Component, Input} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent {

  @Input() valueToCopy: string | undefined;

  constructor(private snackbar: MatSnackBar) {
  }

  copyToClipboard() {
    if(this.valueToCopy) {
      navigator.clipboard.writeText(this.valueToCopy);
      this.snackbar.open('Copied to clipboard!', '', {
        duration: 2000,
      });
    }
  }
}
