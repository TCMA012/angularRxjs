/*
Errors and Angular Armen Vardanyan
https://dev.to/this-is-angular/errors-and-angular-n0b

if the HTTP requests API returns an 200 OK response,
but with an explanation why we cannot access this user's data, we will not have a 404 error, and the handler will not be called.
Let's write an HttpInterceptor to check this and throw an error for us:
*/
export class ResponseErrorInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          if (
            event.body?.hasOwnProperty('success') &&
            !event.body.success
          ) {
            throw new HttpErrorResponse({
              status: 400,
              url: event.url,
              error: event.body.error ?? 'Unknown Error',
            });
          }
        }
        return event;
      }),
    );
  }
}

/*
we handle a success property on a response object, but we can perform any kind of logic, and also have multiple interceptors like this to handle different scenarios. Now we can use the catchError operator to handle this:
*/
@Component({
  ...
})
export class AppComponent {
  user$ = this.userService.getUser().pipe(
    catchError(error => of(handleError(error))),
  );

  constructor(private readonly userService: UserService) {
  }
}

/*
Validating data
Sometimes the type system that TypeScript provides is not enough to safeguard some algorithms. This is particularly common with Angular pipes, when we need to provide a specific form of data, otherwise our logic is going to have problems. For instance, if we have a pipe that finds a user by id we need to make sure the data is not only a number, but also, for example, is an integer and a positive number.
Otherwise, we might get a result that does not reflect reality if we accidentally pass a number that cannot in any way be a number.
To safeguard ourselves and other developers that might use our pipe from this, we can check and throw an error:
*/
class IdError extends RangeError {
    constructor(providedNumber: number) {
        super(
          `Provided number ${providedNumber} is not a valid id. 
           It must be a positive integer.`);
    }
}

@Pipe({
    name: "findUserById",
})
export class FindUserByIdPipe implements PipeTransform {
    transform(users: User[], id: number): User {
        if (!(Number.isInteger(id) && id > 0)) {
            throw new IdError(id);
        }
        const user = users.find(user => user.id === id);
        return user;
    }
}

/*
Now this specific error warns the user of a problem with the provided data, and we won't be dealing with a surprising
or hard-to-catch bug.

Notice we extend from RangeError and not just Error. Sometimes it is useful to extend from more specific error types for better structure. In our case, this specific error is in fact a RangeError, so we use that class to extend.
*/
/*
Warning of design nuances/issues
we want to communicate to other developers about some code design specific.
A situation like this can arise, for example, when we have a component that accepts one input or another, but when provided with both
can result in an unexpected behavior. In this case, it is a good practice to throw an error, and let the developer
who uses our component know what is wrong:
*/
class ComponentInputCompatibilityError extends Error {
    constructor(...properties: string[]) {
        super(`The following properties cannot be provided
               simultaneously: ${properties.join(', ')}`);
    }
}

@Component({
  ...
})
export class MyComponent {
    @Input() property: string;
    @Input() otherProperty: number;

    ngOnChanges(changes: SimpleChanges) {
        if (this.property && this.otherProperty) {
            throw new ComponentInputCompatibilityError(
                'property',
                'otherProperty',
            );
        }
    }
}
/*
In this case, we are now safe that no one will confuse and end up with a strange bug.

Warning: This use case might be indicative of a design issue, so most of the time the best practice would be to
refactor the code to avoid this situation. But of course there are times when changing large chunks of code is not viable.
In these cases, providing a descriptive error is very important.
*/