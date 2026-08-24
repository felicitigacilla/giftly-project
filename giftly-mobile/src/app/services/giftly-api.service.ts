import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_BASE = 'https://giftly-mobile-api.onrender.com/api/index.php?route=';

@Injectable({
  providedIn: 'root',
})
export class GiftlyApiService {
  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('giftly_token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  private buildUrl(route: string, params: Record<string, string | number | boolean> = {}): string {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    );

    const suffix = query.toString();
    return `${API_BASE}${route}${suffix ? `&${suffix}` : ''}`;
  }

  private unwrap<T>(response: any): T {
    if (response && response.body) {
      return response.body;
    }

    return response;
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(this.buildUrl('auth/login'), { email, password }, { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  register(payload: any): Observable<any> {
    return this.http
      .post<any>(this.buildUrl('auth/register'), payload, { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  verifyToken(): Observable<any> {
    return this.http
      .get<any>(this.buildUrl('auth/verify'), { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  logout(): Observable<any> {
    return this.http
      .post<any>(this.buildUrl('auth/logout'), {}, { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  getProducts(params: Record<string, string | number | boolean> = {}): Observable<any> {
    return this.http
      .get<any>(this.buildUrl('products', params), { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  getProduct(id: number): Observable<any> {
    return this.http
      .get<any>(this.buildUrl('products/single', { id }), { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  getCart(): Observable<any> {
    return this.http
      .get<any>(this.buildUrl('cart'), { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  addToCart(productId: number, quantity = 1): Observable<any> {
    return this.http
      .post<any>(this.buildUrl('cart'), { product_id: productId, quantity }, { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  updateCartItem(cartId: number, action: 'increase' | 'decrease'): Observable<any> {
    return this.http
      .put<any>(this.buildUrl('cart/update'), { cart_id: cartId, action }, { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  removeCartItem(cartId: number): Observable<any> {
    return this.http
      .delete<any>(this.buildUrl('cart/remove', { id: cartId }), { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  verifyStock(cartIds: number[]): Observable<any> {
    return this.http
      .post<any>(this.buildUrl('cart/verify-stock'), { cart_ids: cartIds }, { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  createOrder(payload: any): Observable<any> {
    return this.http
      .post<any>(this.buildUrl('orders'), payload, { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }

  getOrders(): Observable<any> {
    return this.http
      .get<any>(this.buildUrl('orders'), { headers: this.authHeaders() })
      .pipe(map((res) => this.unwrap(res)));
  }
}
