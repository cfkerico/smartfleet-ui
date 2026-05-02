import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = signal(false);
  //private count = 0;

  loading = this._loading.asReadonly();

  show() {
    //this.count++;
    this._loading.set(true);
  }

  hide() {
    //this.count--;
    //if (this.count <= 0) {
      this._loading.set(false);
    //}
  }
}