import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountComponent } from './count/count.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CountComponent],
  template: `
    <!--The content below is only a placeholder and can be replaced.-->
    <div style="text-align:center" class="content">
      <h1>
        Welcome to {{title}}!
      </h1>
      <span style="display: block">{{ title }} app is running!</span>
    </div>
    <app-count></app-count>
  `,
  styles: [],
})
export class AppComponent {
  title = 'demo-standalone';
}