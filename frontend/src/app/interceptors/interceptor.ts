import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from sessionStorage
  const excludeUrls : string[] = 
    ['/auth/login',
     '/auth/register'
    ];
  const token = sessionStorage.getItem('accessToken');
  
  // Skip if no token or if it's a login/register request
  if (!token || excludeUrls.some(url => req.url.includes(url))) {   
    return next(req);
  }
  
  // Clone the request and add the authorization header
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  
  return next(authReq);
};