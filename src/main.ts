import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/ar-angular/app.config';
import { AppComponent } from './app/ar-angular/app.component';

await bootstrapApplication(AppComponent, appConfig);