import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular/lazy';
import { GiftlyApiService } from '../../services/giftly-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: any = {};

  constructor(
    private api: GiftlyApiService,
    public router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('giftly_user');
    this.user = storedUser ? JSON.parse(storedUser) : {};
  }

  logout() {
    this.api.logout().subscribe({
      next: async () => {
        localStorage.removeItem('giftly_token');
        localStorage.removeItem('giftly_user');
        this.showToast('Logged out successfully.');
        this.router.navigateByUrl('/login');
      },
      error: async () => {
        localStorage.removeItem('giftly_token');
        localStorage.removeItem('giftly_user');
        this.router.navigateByUrl('/login');
      },
    });
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1500,
      position: 'top',
    });

    await toast.present();
  }
}
