import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular/lazy';
import { GiftlyApiService } from '../../services/giftly-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = 'admin@giftly.test';
  password = 'password123';
  name = '';
  phone = '';
  isRegister = false;
  loading = false;

  constructor(
    private api: GiftlyApiService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async submit() {
    if (!this.email || !this.password) {
      this.showToast('Email and password are required.');
      return;
    }

    this.loading = true;

    if (this.isRegister) {
      if (!this.name) {
        this.showToast('Name is required for registration.');
        this.loading = false;
        return;
      }

      const payload = {
        name: this.name,
        email: this.email,
        phone: this.phone,
        password: this.password,
        confirm_password: this.password,
      };

      this.api.register(payload).subscribe({
        next: async (res) => {
          this.loading = false;
          const message = res?.message || 'Registration successful.';
          this.showToast(message);
          this.isRegister = false;
        },
        error: async (err) => {
          this.loading = false;
          this.showToast(err?.error?.message || 'Registration failed.');
        },
      });

      return;
    }

    this.api.login(this.email, this.password).subscribe({
      next: async (res) => {
        this.loading = false;

        const token = res?.data?.token ?? res?.token ?? '';
        const user = res?.data?.user ?? res?.user ?? { email: this.email };

        if (token) {
          localStorage.setItem('giftly_token', token);
        }

        localStorage.setItem('giftly_user', JSON.stringify(user));
        this.showToast(res?.message || 'Login successful.');
        this.router.navigateByUrl('/shop');
      },
      error: async (err) => {
        this.loading = false;
        this.showToast(err?.error?.message || 'Login failed.');
      },
    });
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'top',
    });

    await toast.present();
  }
}
