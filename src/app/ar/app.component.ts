import { Component } from '@angular/core';
import { ArScreenComponent } from './features/ar/ar-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ArScreenComponent],
  template: `<app-ar-screen></app-ar-screen>`
})
export class AppComponent { }
