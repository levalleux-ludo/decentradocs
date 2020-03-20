import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ArweaveService } from '../arweave/arweave.service';
import { EthService } from '../ethereum/eth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private arweaveService: ArweaveService,
        private eth: EthService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.arweaveService.authenticated && this.eth.authenticated) {
            // authenticated so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/authenticate'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
