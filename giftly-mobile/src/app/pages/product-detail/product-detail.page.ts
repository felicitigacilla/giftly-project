import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular/lazy';
import { GiftlyApiService } from '../../services/giftly-api.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
  product: any = null;
  quantity = 1;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private api: GiftlyApiService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: number) {
    this.loading = true;
    this.api.getProduct(id).subscribe({
      next: (res) => {
        this.loading = false;
        this.product = res?.data ?? res;
      },
      error: async () => {
        this.loading = false;
        this.showToast('Product is not available right now.');
      },
    });
  }

  increaseQuantity() {
    this.quantity += 1;
  }

  decreaseQuantity() {
    this.quantity = Math.max(1, this.quantity - 1);
  }

  addToCart() {
    if (!this.product) {
      return;
    }

    const token = localStorage.getItem('giftly_token');
    if (!token) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.api.addToCart(this.product.id, this.quantity).subscribe({
      next: async (res) => {
        this.showToast(res?.message || 'Added to cart.');
      },
      error: async (err) => {
        this.showToast(err?.error?.message || 'Unable to add item.');
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
