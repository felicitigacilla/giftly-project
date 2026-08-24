import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular/lazy';
import { GiftlyApiService } from '../../services/giftly-api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  items: any[] = [];
  total = 0;
  loading = false;

  constructor(
    private api: GiftlyApiService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.api.getCart().subscribe({
      next: (res) => {
        this.loading = false;
        const payload = res?.data ?? res;
        this.items = payload?.items ?? payload?.cart ?? [];
        this.total = payload?.total ?? 0;
      },
      error: async () => {
        this.loading = false;
        this.showToast('Unable to load your cart.');
      },
    });
  }

  changeQuantity(item: any, action: 'increase' | 'decrease') {
    const cartId = item.cart_id ?? item.id;
    this.api.updateCartItem(cartId, action).subscribe({
      next: () => this.loadCart(),
      error: async (err) => this.showToast(err?.error?.message || 'Unable to update quantity.'),
    });
  }

  removeItem(item: any) {
    const cartId = item.cart_id ?? item.id;
    this.api.removeCartItem(cartId).subscribe({
      next: () => this.loadCart(),
      error: async (err) => this.showToast(err?.error?.message || 'Unable to remove item.'),
    });
  }

  goToCheckout() {
    const token = localStorage.getItem('giftly_token');
    if (!token) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.router.navigateByUrl('/checkout');
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1800,
      position: 'top',
    });

    await toast.present();
  }
}
