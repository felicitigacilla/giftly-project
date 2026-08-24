import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular/lazy';
import { GiftlyApiService } from '../../services/giftly-api.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  order = {
    fullname: '',
    address: '',
    city: '',
    payment_method: 'cod',
    delivery_date: '',
    delivery_time: '08:00:00',
    gift_message: '',
    recipient_name: '',
    recipient_phone: '',
  };
  cartItems: any[] = [];
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
    this.api.getCart().subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        this.cartItems = payload?.items ?? payload?.cart ?? [];
      },
      error: () => {
        this.showToast('Unable to load cart for checkout.');
      },
    });
  }

  placeOrder() {
    if (!this.order.fullname || !this.order.address || !this.order.city) {
      this.showToast('Please complete your shipping details.');
      return;
    }

    const selectedIds = this.cartItems.map((item) => item.cart_id ?? item.id);
    if (!selectedIds.length) {
      this.showToast('Your cart is empty.');
      return;
    }

    this.loading = true;
    this.api.createOrder({
      ...this.order,
      selected_ids: selectedIds,
    }).subscribe({
      next: async (res) => {
        this.loading = false;
        this.showToast(res?.message || 'Order placed successfully.');
        this.router.navigateByUrl('/orders');
      },
      error: async (err) => {
        this.loading = false;
        this.showToast(err?.error?.message || 'Unable to place your order.');
      },
    });
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
