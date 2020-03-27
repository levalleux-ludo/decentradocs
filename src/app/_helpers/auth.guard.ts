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

    public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
      console.log("canActivate ?");
      try {
        if (await this.authenticateService.isAuthenticated()) {
            // authenticated so return true
            console.log("canActivate: true");
            return true;
        }
      } catch (err) {
        console.warn(err);
      }

        // console.log("canActivate: false", "arweave:", this.arweaveService.authenticated, "eth:", this.eth.authenticated);
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/authenticate'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
