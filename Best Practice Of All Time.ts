/*
The Most Impactful RxJs Best Practice Of All Time
Tomas Trajan
https://angularexperts.io/blog/the-most-impactful-rx-js-best-practice-of-all-time/
It is ALWAYS possible to FULLY define a RxJs stream from the start! We can include all the possible sources of change in the initial stream definition. Because of this, it is NEVER necessary to re-create a stream during the component (or service) lifetime!

Example of proper definition of RxJs stream including all sources of change from start
Our this.product$ stream is defined ONLY ONCE in the property assignment and will NOT change for the lifetime of the component.

The stream is mapping selected product ID into a response of the backend call to load product info (with help of flattening operator switchMap which subscribes to the inner observable, our backend request)


*/
@Component({
  template: ` <!-- some nice product cards -->
    <button (click)="selectProduct(1)"> Product 1 </button>
    <button (click)="selectProduct(2)"> Product 2 </button>
    <button (click)="selectProduct(3)"> Product 3 </button>

    <product-info *ngIf="product$ | async as product" [product]="product">
    </product-info>`,
})
export class ProductChooser {
  selectedProductId$ = new Subject<number>();

  product$ = this.selectedProductId$.pipe(
    switchMap((productId) => this.productService.loadProduct(productId)),
  );

  constructor(private productService: ProductService) {}

  selectProduct(productId: number) {
    this.selectedProductId$.next(productId);
  }
}



//We could have also used our selectedProductId$ Subject directly in the template to make the code even more succinct
@Component({
  template: ` <!-- some nice product cards -->
    <button (click)="selectedProductId$.next(1)"> Product 1 </button>
    <button (click)="selectedProductId$.next(2)"> Product 2 </button>
    <button (click)="selectedProductId$.next(3)"> Product 3 </button>

    <product-info *ngIf="product$ | async as product" [product]="product">
    </product-info>`,
})
export class ProductChooser {
  selectedProductUd$ = new Subject<number>();

  product$ = this.selectedProductUd$.pipe(
    switchMap((productId) => this.productService.loadProduct(productId)),
  );

  constructor(private productService: ProductService) {}
}
//Example of RxJs stream definition which includes all the sources of change from the beginning with more succinct implementation when we use Subject directly in the template…




// Example of proper definition of RxJs stream including all sources of change from start
@Component(/* ... */)
export class ComplexProductChooser implements OnInit, OnDestroy {
  productForm$: Observable<FormGroup>; // will be subscribed in tpl with | async pipe
  productTypes$: Observable<ProductType[]>; // will be subscribed in tpl with | async pipe

  constructor(private activatedRoute: ActivatedRoute /* ... */) {}

  ngOnInit() {
    // define stream of productId
    const productId$ = this.activatedRoute.params.pipe(
      map((params) => params.productId),
    );

    // define stream of product types (switchMap because getTypes returns Observable)
    this.productTypes$ = productId$.pipe(
      switchMap((productId) => this.productService.getTypes(productId)),
    );

    // define stream of forms (map because this.buildForm is a sync method)
    this.productForm$ = productId$.pipe(
      map((productId) => this.buildForm(productId)),
    );

    // define stream to perform side-effect, only ONE stream instance will exist
    // listen to changes of productType form field to perfom side-effect
    this.productForm$
    .pipe(
      // switchMap because we want to perform side-effect only for the latest form
      switchMap((form) => form.get('productType').valueChanges),
      takeUntil(this.destroy$),
    )
    .subscribe((productType) =>
      // perform side-effect
      this.sidebarService.loadAndDisplayContextualProductInfo(productType),
    );
}

