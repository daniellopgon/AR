import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/state/notification.state';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (msg of notificationService.messages(); track msg.id) {
        <div class="toast" [ngClass]="msg.type" (click)="notificationService.remove(msg.id)">
          {{ msg.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none; 
    }
    .toast {
      pointer-events: auto;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-family: 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      backdrop-filter: blur(8px);
    }
    .error { background: rgba(220, 53, 69, 0.9); }
    .success { background: rgba(40, 167, 69, 0.9); }
    .info { background: rgba(23, 162, 184, 0.9); }
    .warning { background: rgba(255, 193, 7, 0.9); color: #333; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  protected readonly notificationService = inject(NotificationService);
}
