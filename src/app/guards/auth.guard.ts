import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isRegistered()) {
        router.navigate(['/login']);
        return false;
    }
    if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
        return false;
    }
    return true;
};
