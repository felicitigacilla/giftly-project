import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { GiftlyApiService } from '../../services/giftly-api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  orders: any[] = [];
  loading = false;

  constructor(
    private api: GiftlyApiService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.api.getOrders().subscribe({
      next: (res) => {
        this.loading = false;
        const payload = res?.data ?? res;
        this.orders = payload?.orders ?? [];
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
