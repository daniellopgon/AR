import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ArScreenComponent } from './components/ar-screen/ar-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ArScreenComponent],
  template: `<app-ar-screen></app-ar-screen>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent { }
