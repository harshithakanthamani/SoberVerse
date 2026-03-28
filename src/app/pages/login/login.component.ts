import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
    private router = inject(Router);
    private authService = inject(AuthService);

    mode = signal<'login' | 'register'>('login');

    username = '';
    password = '';
    confirmPassword = '';
    error = signal('');
    isLoading = signal(false);
    showSuccess = signal(false);
    showPassword = signal(false);

    ngOnInit() {
        if (!this.authService.isRegistered()) {
            this.mode.set('register');
        }
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    switchMode(mode: 'login' | 'register') {
        this.mode.set(mode);
        this.error.set('');
        this.password = '';
        this.confirmPassword = '';
    }

    async handleSubmit(event: Event) {
        event.preventDefault();
        this.error.set('');

        if (!this.username.trim()) {
            this.error.set('Please enter your username.');
            return;
        }
        if (!this.password) {
            this.error.set('Please enter your password.');
            return;
        }

        if (this.mode() === 'register') {
            if (this.authService.isRegistered()) {
                this.error.set('An account already exists on this device.');
                return;
            }
            if (this.password.length < 6) {
                this.error.set('Password must be at least 6 characters.');
                return;
            }
            if (this.password !== this.confirmPassword) {
                this.error.set('Passwords do not match.');
                return;
            }

            this.isLoading.set(true);
            const success = await this.authService.register(this.username, this.password);
            if (success) {
                this.showSuccess.set(true);
                setTimeout(() => this.router.navigate(['/']), 1200);
            } else {
                this.error.set('Registration failed. Please try again.');
                this.isLoading.set(false);
            }
        } else {
            this.isLoading.set(true);
            const success = await this.authService.login(this.username, this.password);
            if (success) {
                this.showSuccess.set(true);
                setTimeout(() => this.router.navigate(['/']), 1200);
            } else {
                this.error.set('Incorrect username or password.');
                this.isLoading.set(false);
            }
        }
    }
}
