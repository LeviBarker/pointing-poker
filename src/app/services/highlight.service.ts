import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class HighlightService {

  constructor(private http: HttpClient) { }

  getHighlights(): Observable<{ highlights: any[] }> {
    // @ts-ignore
    return this.http.get('https://us-central1-levi-barker-product.cloudfunctions.net/getHighlights');
  }
}
