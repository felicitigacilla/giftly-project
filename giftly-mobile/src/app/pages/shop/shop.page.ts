import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular/lazy';
import { GiftlyApiService } from '../../services/giftly-api.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
})
export class ShopPage implements OnInit {
  products: any[] = [];
  categories = ['Our Collection', 'Perfume', 'Accessories', 'Chocolates', 'Candles'];
  selectedCategory = 'Our Collection';
  loading = false;

  constructor(
    private api: GiftlyApiService,
    public router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.api.getProducts({ page: 1, limit: 20 }).subscribe({
      next: (res) => {
        this.loading = false;
        const payload = res?.data?.products ?? res?.products ?? [];
        this.products = Array.isArray(payload) ? payload : [];
      },
      error: async () => {
        this.loading = false;
        this.showToast('Could not load products.');
      },
    });
  }

  addToCart(product: any) {
    const token = localStorage.getItem('giftly_token');
    if (!token) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.api.addToCart(product.id, 1).subscribe({
      next: async (res) => {
        this.showToast(res?.message || 'Item added to cart.');
      },
      error: async (err) => {
        this.showToast(err?.error?.message || 'Unable to add item to cart.');
      },
    });
  }

  changeCategory(category: string) {
    this.selectedCategory = category;
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
