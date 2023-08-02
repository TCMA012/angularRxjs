import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, map, shareReplay, take } from 'rxjs';

/*
https://itnext.io/share-sharereplay-refcount-a38ae29a19d
Example 1
*/
@Component({
  selector: 'app-count',
  standalone: true,
  imports: [CommonModule],
  template: `
  Example 1
    <ng-container *ngIf="flag"> {{ count1$ | async }} </ng-container>
    <ng-container *ngIf="!flag"> {{ count2$ | async }} </ng-container>
  `,
  styles: [
  ]
})
export class CountComponent implements OnInit {
  flag = true;

  readonly count$ = interval(1000).pipe(
    take(7),
    shareReplay({ bufferSize: 1, refCount: false }) // 👈 line: 15
  );

  readonly count1$ = this.count$.pipe(
    take(3),
    map((c) => `count1: ${c}`)
  );
  readonly count2$ = this.count$.pipe(
    take(3),
    map((c) => `count2: ${c}`)
  );

  ngOnInit(): void {
    setTimeout(() => {
      this.flag = false;
    }, 5500);
    console.log('ngOnInit TC');
  }
}