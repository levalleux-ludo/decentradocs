import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ArweaveService } from '../arweave/arweave.service';
import { EthService } from '../ethereum/eth.service';
import { Observable } from 'rxjs';
import { AuthenticateService } from '../authenticate/authenticate.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticateService: AuthenticateService
    ) {}

    // public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    //   return new Promise<boolean>((resolve, reject) => {
    //     console.log("canActivate ?");
    //     this.authenticateService.isAuthenticated().subscribe((isAuth) => {
    //       console.log("canActivate:", isAuth);
    //       if (!isAuth) {
    //         // console.log("canActivate: false", "arweave:", this.arweaveService.authenticated, "eth:", this.eth.authenticated);
    //         // not logged in so redirect to login page with the return url
    //         this.router.navigate(['/authenticate'], { queryParams: { returnUrl: state.url }});
    //       }
    //       resolve(isAuth);
    //     }, (err) => reject(err));
    //   });
    // }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      console.log("canActivate ?");
      const isAuth = this.authenticateService.authenticated;
      console.log("canActivate:", isAuth);
      if (!isAuth) {
        // console.log("canActivate: false", "arweave:", this.arweaveService.authenticated, "eth:", this.eth.authenticated);
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/authenticate'], { queryParams: { returnUrl: state.url }});
      }
      return isAuth;
    }
  }
