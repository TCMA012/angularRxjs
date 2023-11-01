/*
Always use inject Armen Vardanyan for This is Angular
Posted on Dec 2, 2022

Always use "inject"
https://dev.to/this-is-angular/always-use-inject-2do4
*/
//Reusability. use inject to share code between components.
import { ActivatedRoute } from '@angular/router';

function getRouteParam(paramName: string): string {
  const route = inject(ActivatedRoute);
  return route.snapshot.paramMap.get(paramName);
}

@Component({
  selector: 'app-root',
    template: `
        <h1>Route param: {{ id }}</h1>
    `,
})
export class AppComponent {
  id = getRouteParam('id');
}



//Type inference
import { InjectionToken } from '@angular/core';

const TOKEN = new InjectionToken<string>('token');

@Component({
    // component metadata
})
export class AppComponent {
    private token = inject(TOKEN);
    // type "string" is inferred
}



//Easier inheritance
export class ParentClass {
    private router = inject(Router);
}

@Component({
    // component metadata
})
export class ChildComponent extends ParentClass {
    private http = inject(HttpClient);
}



//Custom RxJS operators
function toFormData() {
    const utilitiesService = inject(UtilitiesService);
    return (source: Observable<any>) => {
        return source.pipe(
            map((value) => {
                return utilitiesService.toFormData(value);
            }),
        );
    };
}

@Component({
    // component metadata
})
export class AppComponent {
    private formData$ = this.http.get('https://example.com').pipe(
        toFormData(),
    );
}



/*
The inject function is only available in dependency injection contexts, so trying to use it in model or DTO classes, for example, will result in errors. Read more about this in the Angular documentation. This has a workaround using the runInContext API, with something like this:
@Component({
    // component metadata
})
export class AppComponent {
   constructor(
    private injector: EnvironmentInjector,
   ) {}

   ngOnInit() {
       this.injector.runInContext(() => {
           const token = inject(TOKEN);
           // use the token freely outside of the constructor
       });
   }
   
/*
Read more about this in an article by Nethanel Basal: Getting to Know the runInContext API in Angular.
https://netbasal.medium.com/
*/