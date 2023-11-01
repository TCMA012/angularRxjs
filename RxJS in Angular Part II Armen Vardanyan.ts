/*
RxJS in Angular Part II Armen Vardanyan
https://indepth.dev/posts/1316/rxjs-in-angular-part-ii

part I:
always think from the perspective of how the state affects the UI and how to derive the state to be displayed from the state at hand

Understand what part of the state affects the UI and make it an Observable stream
Use RxJS operators to perform calculations and derive the final state to be used in UI
Use the async pipe to put the result of our computations in the template



a component that displays the current time in a specific format (let's say am/pm vs 24h), and also a dropdown which allows the user to select the preferred format. 
a formatTime function, which receives the time and the format and returns the pretty, ready for UI version of it. 

combine the current datetime (using interval) and the format valueChanges together, and then map them to what  will display to the end user.

declarative :)
the async pipe unsubscribes itself
*/

@Component({
  selector: 'app-example',
  template: `
  <select [formControl]="format">
    <option value="24h">24 Hour</option>
    <option value="ampm">AM PM</option>
  </select>

  {{ formattedTime$ | async }}
  `,
})
export class ExampleComponent {
  format = new FormControl('24h');
  formattedTime$ = combineLatest(
    interval(900).pipe(map(() => new Date())),
    this.format.valueChanges.pipe(startWith('24h')),
  ).pipe(
    map(([dateTime, format]) => formatTime(dateTime, format)),
  );
}

/*
RxJS:
Everything is a stream. Even singular values. Even no value at all.

a list of users not as just a list of users, but a stream of past, current and future lists of users, and act accordingly.

a simple form that is divided into two columns:
some fields are in the right column, some are in the left column.
besides from these fields, there are also custom fields, which users themselves created and need to fill in; the list of custom fields is retrieved from the backend (A Promise of an Array of objects). 
We want to preserve the symmetry of our UI, and display half of the custom fields on the right side, and the other half on the left, say, odd fields on the left and even fields on the right.
*/
@Component({
  selector: 'app-example',
  template: `
  <div class="left-column">
    <div>
      <label>First Name</label>
      <input />
    </div>
    <div>
      <label>Age</label>
      <input />
    </div>
    <div>
      <label>Occupation</label>
      <input />
    </div>

    <div *ngFor="let field of (oddFields$ | async)">
      <label>{{ field.label }}</label>
      <input />
    </div>
  </div>
  <div class="right-column">
    <div>
      <label>Last Name</label>
      <input />
    </div>
    <div>
      <label>Interests</label>
      <input />
    </div>
    <div>
      <label>About yourself</label>
      <input />
    </div>

    <div *ngFor="let field of (evenFields$ | async)">
      <label>{{ field.label }}</label>
      <input />
    </div>
  </div>
  `,
})
export class ExampleComponent {
/*
Describe that we have all the custom fields streamed separately using switchAll;
Use partition to divide the streams into two parts: odd indexed (starting from 1, not 0) fields to the left, even indexed fields to the right;
Use toArray to actually make these separate streams of fields two distinct arrays;
Display it in the view
*/
  customFields: [Observable<Field[]>, Observable<Field[]>] = partition(
    from(this.customFieldsService.getCustomFields()).pipe(switchAll()),
    (_, index) => index % 2 === 0,
  );
  oddFields$ = this.customFields[0].pipe(toArray());
  evenFields$ = this.customFields[1].pipe(toArray());

  constructor(
    private readonly customFieldsService: CustomFieldsService,
  ) {}
}

/*
subscribe may very well be the worst method ever. If we are subscribing to a stream inside our component, it means we are allowing imperative code to leak inside our functional/reactive code. Other than cases when it is impossible to avoid, never use subscribe;
Avoid tap at all costs. tap is literally used to perform a side effect, which is in itself a bad thing from a purely functional point of view; tap also often is a harbour for imperative code, and generally also disrupts the harmonious flow of RxJS operators;
Write custom RxJS operators. If we find yourself repeating the same chain of operators in your application (e.g. filter with this condition, then map to this and then finally collect all using toArray), then we may consider moving that particular logic to a custom operator of ours; while it may sound complicated, we can simplify and think of custom RxJS operators as functions that receive an Observable, and return another, which is usually a modified version of the previous one, possibly built by combining RxJS operators; so we can use the operators we want in the right order and not type it every time.
If you do write custom operators, do your best to ensure your custom operators are pure function: don't use tap, don't perform your own side effects.



RxJS: Combining Operators
https://ncjamieson.com/combining-operators/
https://ncjamieson.com/improving-the-static-pipe-function/
https://github.com/cartant/rxjs-etc/blob/v7.2.1/source/genericPipe.ts#L8-L22
*/

C:
cd C:\AngularRxjs\

ng new RxJS_in_Angular_ArmenVardanyan

Would you like to add Angular routing? Yes
