import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GiftlyApiService } from '../services/giftly-api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  featuredProducts: any[] = [];
  loading = false;

  constructor(
    private router: Router,
    private api: GiftlyApiService
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.loading = true;
    this.api.getProducts({ page: 1, limit: 6 }).subscribe({
      next: (res) => {
        this.loading = false;
        this.featuredProducts = res?.data?.products ?? res?.products ?? [];
      },
      error: () => {
        this.loading = false;
        this.featuredProducts = [];
      },
    });
  }

  goToLogin() { this.router.navigateByUrl('/login'); }
  goToShop() { this.router.navigateByUrl('/shop'); }
  goToCart() { this.router.navigateByUrl('/cart'); }
  goToOrders() { this.router.navigateByUrl('/orders'); }
  goToProfile() { this.router.navigateByUrl('/profile'); }
}
