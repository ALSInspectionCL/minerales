import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class CookieService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  getCookie(name: string): string | null {
    const value = `; ${this.document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length > 1) {
      const lastPart = parts.pop();
      if (lastPart) {
        return lastPart.split(';').shift() ?? null;
      }
    }
    return null;
  }
}