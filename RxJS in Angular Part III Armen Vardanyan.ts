/*
RxJS in Angular Part III Armen Vardanyan
https://indepth.dev/posts/1364/rxjs-in-angular

Implementing a "You have been inactive for a while" popup in RxJS

First of all, we have to understand what the stream of our data will be. 
The final information we want to receive is a boolean value about if "has the user performed some sort of event like move the mouse or click somewhere in the past one minute or so?", so to get it we need to monitor and buffer those events for a while, using interval:
*/
const perMinute$ = interval(60_000);

/*
After that we should decide the events we want to listen to, which we will consider as the user being somehow active, and merge them:
*/
const events$ = merge(
    fromEvent(document.body, 'click'),
    fromEvent(document.body, 'mousemove'),
    fromEvent(document.body, 'scroll'),
);

/*
This list of events is far from complete, but you can add as many events as you want to fit you needs.

After that we want to count how many events in a minute have the system recorded, and this is the most tricky part, but RxJS again provides us with a beautiful solution:
an operator called 
bufferWhen, 
which receives another Observable to monitor events. What it does is start collecting events from the source stream, push them into an array, then, when the inner Observable emits, emit that array and start over. In our case we will use our events$ Observable as the source, and count the events using the interval timer (one minute):
*/

const bufferedEvents$ = events$.pipe(
    bufferWhen(() => interval$),
).subscribe(console.log);

/*
Here we see that every 5 seconds (I have reduced the interval size to 5 secs for the purpose of not having 10,000+ events in the console) our Observable emits an array of all specified events in that past timeframe. So how can we know that the user was inactive? Well, if there have been no events in that time interval, the resulting Array will be empty, thus our final code will look like this:
Implementing a "You have been inactive for a while" notice popup:
*/

const bufferedEvents$ = events$.pipe(
    bufferWhen(() => interval$),
    filter(events => events.length === 0),
    // no events in a timeframe means an empty array
).subscribe(() => alert('You have been inactive for a minute!'));

/*
Using RxJS to get dynamic information about the DOM

we want to create a "scroll to top" button on our page, but we want to show it only when the user has scrolled down a bit. We could write a HostBinding, recalculate the distance fom top using window.scrollY, compare it to a sufficient value (let's say the user has scrolled for 500px), store in a property as a boolean... but then again, we promised to use RxJS right away. So, let's turn on our reactive thinking: what is the information we need? It is whether the user has scrolled sufficiently, so window.scrollY. When does this information change? When the user scrolls, of course. So, the source of our stream is the scroll event, and we should map it to the scrolled distance.
*/

@Component({
  selector: 'my-app',
  template: `
  	<div>
    	lots of content that creates vertical scroll here
        <button *ngIf="showBtn$ | async">Scroll to top</button>
    </div>
  `,
})
export class MyComponent {
  showBtn$ = fromEvent(document, 'scroll').pipe(
    map(() => window.scrollY > 500),
  );
}

/*
If we add a 
tap(() => console.log('Working'))

 to our Observable, we would see that the even is triggered just too many times. 
How we fix it? Well, to be completely honest we don't need to recalculate the distance all the time; it's fairly sufficient to debounce that process a little. See where I'm going with this? Yes, we can just add 

debounceTime(50)

 to make it run after there has been a 50 milliseconds pause between scrolling. This will significantly reduce the amount of value changes (and re-renders in some cases) that will happen without taking away the smoothness of transition of button being visible and not being visible. While this is a minor optimization, it opens door to a huge discussion about how we can make our code in Angular more performant using RxJS, which we will dive into deeper in the next chapter.
*/