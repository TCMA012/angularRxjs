/*
RxJS in Angular Part I Armen Vardanyan
RxJS in Angular: Part I
https://indepth.dev/posts/1162/rxjs-in-angular-part-1
https://armenvardanyan.dev/
a three-step plan of thinking. 
Trying to solve the same problem, but now using Reactive Forms and RxJS:

Understand what part of the state affects the UI and make it an Observable stream;
Use RxJS operators to perform calculations and derive the final state to be used in UI
Use the async pipe to put the result of our computations in the template.

a property, which is an Observable, to handle some UI. It combines the output of our three form controls using 
combineLatest,
 then uses their combined output to derive the boolean state.

we used 
startWith
 because in Angular 
formControl.valueChanges
 does not start to emit until the user manually changes it through UI controls, or imperatively through setValue and combineLatest does not fire until all of the source Observables emit at least once; so we make them all emit their default values once immediately.
 
 

“when is this button disabled?”, go through the following steps:
See the [disabled]="isDisabled$ | async" binding; the dollar sign at the end will immediately betray that it is an Observable;
Go to that property definition and see it is a combination of three sources of data;
See how the data is mapped to a boolean



Properties are easier to reason about than methods
*/

import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'my-app',
  template: `
    <select [formControl]="selectedUserId">
      <option>Select a User</option>
      <option *ngFor="let user of users" [value]="user.id">{{ user.name }}</option>
    </select>
    <select [formControl]="blackListedUsers" multiple>
      <option *ngFor="let user of users" [value]="user.id">{{ user.name }}</option>
    </select>
    Allow black listed users <input type="checkbox" [formControl]="allowBlackListedUsers"/>
    <button [disabled]="isDisabled$ | async">Submit</button>
  `,
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  users = [
    {name: 'John', id: 1},
    {name: 'Andrew', id: 2},
    {name: 'Anna', id: 3},
    {name: 'Iris', id: 4},
  ];

  blackListedUsers = new FormControl([]);
  selectedUserId = new FormControl(null);
  allowBlackListedUsers = new FormControl(false);
  isDisabled$ = combineLatest([
    this.allowBlackListedUsers.valueChanges.pipe(startWith(false)),
    this.blackListedUsers.valueChanges.pipe(startWith([])),
    this.selectedUserId.valueChanges.pipe(startWith(null), map(id => +id)),
  ]).pipe(
    map(
      ([allowBlackListed, blackList, selected]) => !allowBlackListed && blackList.includes(selected),
    ),
  )
}

/*
Toggling state
examples of how two pieces of data are interdependent; one may change the other and the later may change the former. 
e.g.: a component that has a search button
whenever we click on it, a search input appears right next to it
whenever we click somewhere else, it disappears, but not if something is written inside it already.

We have a single source of truth, no methods at all, and the entire logic comes from this operators on the source observables. 

Explanation:

First we took two streams — the clicks on the button and the clicks on the entire document
On the first stream — the button clicks — we first called stopPropagation, and then mapped it to be true
The second stream — the clicks on the entire document — is being simply mapped to the value false, but not when the query in not empty (hence the filter operator)
The merge of this two streams is exactly what we want — the button opens the search input and the rest close it!

We put it inside ngAfterViewInit because the buttonRef will not be available until the view is painted, so we have to wait until after that moment to be able to read events from it.
We need .pipe(startsWith(false)) after the merged Observable:
If we have not done it, the value of the Observable would have changed from undefined to false too fast, resulting in an ExpressionChangedAfterItHasBeenCheckedError

The async pipe unsubscribe from our Observable
*/

@Component({
  selector: 'my-app',
  template: `
    <button #btn>Search</button>
    <input [(ngModel)]="query" *ngIf="isSearchInputVisible$ | async"/>
  `,
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('btn', {static: true}) buttonRef: ElementRef<HTMLButtonElement>;
  query = '';
  isSearchInputVisible$: Observable<boolean> = of(false);

  ngAfterViewInit() {
    this.isSearchInputVisible$ = merge(
      fromEvent(this.buttonRef.nativeElement, 'click').pipe(tap(e => e.stopPropagation()), mapTo(true)),
      fromEvent(document.body, 'click').pipe(filter(() => this.query === ''), mapTo(false))
    ).pipe(startWith(false));
  }

}

C:
cd C:\AngularRxjs\

ng new RxJSinAngularPartIArmenVardanyan


ng new RxJS_in_Angular_ArmenVardanyan

Would you like to add Angular routing? Yes

cd RxJS_in_Angular_ArmenVardanyan


ng generate component isDisabledComp

ng generate component togglingState

TODO modify isDisabledComp