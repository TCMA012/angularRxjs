/*
Angular Forms Useful Tips Armen Vardanyan
https://indepth.dev/posts/1224/angular-forms-useful-tips
21 April 2020

Limit your use of FormGroup.get usage when referring to nested controls in a FormGroup. Instead, store the references to the nested controls in component properties.
Use DTO pattern when changing the data model of the form to the one required by a data service.
Abstract away harder form controls to custom components implementing ControlValueAccessor.

DTO, or data transfer object
DTO is a special object, which is responsible for carrying information from one subsystem (our Angular application) to another (the backend). It’s main and original purpose was to reduce the amount of data sent over a network. But it also ensures that the subsystems talk to each other using the same language (same data types). So how are we going to benefit from this pattern? By writing a simple class, which will receive the form value in its constructor and produce an object that exactly matches the server’s API signature, handling all differences between what our raw form value is and what the server awaits. It is very important that our class does not have any other behaviors, getters, setters and so on — that is stuff that is not going to be serialized with JSON.stringify, and our class is going to have a single responsibility — produce a data transfer object. 

https://en.wikipedia.org/wiki/Data_transfer_object

https://indepth.dev/posts/1055/never-again-be-confused-when-implementing-controlvalueaccessor-in-angular-forms
*/
export class ArticleDTO {
  title: string;
  tags: string;
  date: string;
  referenceIds: number[];

  constructor(formValue: RawFormValue) {
    this.title = formValue.title;
    this.tags = formValue.tags.join(',');
    this.date = formValue.date.toISOString();
    if (formValue.referenceIds && formValue.referenceIds.length > 0) {
      this.referenceIds = formValue.referenceIds;
    }
  }
}

export interface RawFormValue {
  title: string;
  tags: string[];
  date: Date;
  referenceIds?: number[];
}

/*
Now this class is pretty simple: it handles the transformation of one object (our raw form value) into another (which is going to the backend). The logic is entirely encapsulated inside the constructor. If there are problems, the constructor is the single place throughout out codebase where it could have possibly happened; if there are problems with type, the RawFormValue interface is where we should look. Here is an example of how we can use this pattern:
*/

export class AppComponent  {
  // rest of the component implementation is ommitted for brevity

  submit() {
    if (this.form.valid) {
      const article = new ArticleDTO(this.form.value as RawFormValue);
      // now send the article DTO to the backend using one of your services
    }
  }
}

/*
This has several benefits:

The business logic of the app with data manipulations and handling is being moved out from the component (it really does not belong there)
That logic is contained in a single place in our app, which is solely responsible for that logic (easier to catch bugs)
This plays nicely with whatever data manipulation strategy you use, from plain old JS objects to state management and, for example, NGRX normalizations
*/

/*
 creating custom controls. Implementing the ControlValueAccessor interface in a component and registering it with NG_VALUE_ACCESSOR provider allows us to create a custom Angular Form Control. This means our <custom-component></custom-component> can now take FormControl and ngModel like this:
*/
<custom-component formControlName="controlName"></custom-component>

//async validator check if a user with that email exists

/*
if we call setValue on a FormGroup with an object that lacks some keys from the form signature, it will throw an error. This is useful, because it allows for some type safety in the dynamic world of Reactive Forms. But it has a gotcha: it also throws an error whenever the object we pass to it has a property that our form does not.


There are two approaches:

Use patchValue when setting value from external API-s. This solves the problem at hand, but may create other problems in the future — what if API design has a real breaking change and some fields go missing in the response? Rather than seeing blank screens/input fields we would want to see normal error message, and patchValue just does not throw.
The complete solution: write an intermediary function (or maybe a class) which converts the server response to something compatible with our form’s signature (kind of like the opposite of what we did when sending the form’s value to the server). Here is an example:
*/
interface RawFormValue {
  firstName: string;
  lastName: string;
  age: number;
}

function toRawFormValue<T extends RawFormValue>(serverData: T): RawFormValue {
  return {
    firstName: serverData.firstName,
    lastName: serverData.lastName,
    age: serverData.age,
  }
}
/*
Notice how the typing is as strict as you can get — functions receives any object that contains the same fields as our forms, extracts those fields and returns an object that contains only them — fully compatible with our code. If API design changes, the only thing we will have to do is change this function.
*/
/*
Forms and events
One important feature of the ReactiveForms is that they emit and read different events — control has been touched, control became dirty, value has changed, validity has changed, and so on. We utilize that in lots of forms, but the most popular is subscribing to FormControl.valueChanges Observable. This Observable provides a stream of changes on the control, either triggered by the user or programmatically.

Notice how I said or programmatically.

This means calling FormControl.setValue will trigger an emission to the subscribers of its valueChanges. This may result in unexpected results sometimes. Imagine the following scenario: a directive that binds to every [formControl], injects a reference to NgControl, reads the valueChanges0, removes all trailing spaces from it and sets the value on the control.
*/

@Directive({
  selector: '[formControl]'
})
export class TrimDirective implements OnInit {

  constructor(
    private ngControl: NgControl,
  ) { }

  ngOnInit() {
    this.ngControl.valueChanges.subscribe(
      (value: string) => this.ngControl.control.setValue(value.trim())
    );
  }
}

/*
This directive does exactly that — don’t allow trailing spaces in inputs. But here’s the catch — as soon as the user inputs anything, it will trigger the directive, which will set the new value, which will trigger the directive to set a new value which will trigger the directive to… Well, you see the trap.

This may easily be avoided with an option called emitEvent, which is set to true by default. When it is false, what it essentially does is tell the FormControl that the value must be changed, but the subscribers must not be notified about that change.

Here’s how it works:
*/

(value: string) => this.ngControl.control.setValue(value.trim(), {emitEvent: false}),
/*
Be careful with this — take into consideration that if you set a value while emitEvent: false, subscriber’s won’t be notified.
*/