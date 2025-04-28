import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const cloned = request.clone({
      setHeaders: {
        'X-API-KEY': '5939b38f-5a69-4488-94e7-a7705ba3cf0e'
      }
    });
    console.log('Intercepting request to:', request.url);
    return next.handle(cloned);
  }
}
