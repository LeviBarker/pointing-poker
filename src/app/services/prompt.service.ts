import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PromptService {

  constructor(private http: HttpClient) { }

  prompt(question: string) {
    return this.http
      .post('https://lb-ai-3d7b5.firebaseapp.com/ask', {question})
      .pipe(
        map((response: any) => response?.choices[0]?.message?.content || response),
        catchError((error) => of(error.error)),
      )
  }

}
