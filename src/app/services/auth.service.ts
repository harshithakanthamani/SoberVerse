import { Injectable, signal } from '@angular/core';

const AUTH_KEY = 'sv_auth_user';
const SESSION_KEY = 'sv_auth_session';

interface StoredUser {
    username: string;
    passwordHash: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _isAuthenticated = signal(false);
    private _currentUser = signal<string | null>(null);

    constructor() {
        // Restore session from sessionStorage (cleared on browser close)
        const session = sessionStorage.getItem(SESSION_KEY);
        if (session) {
            const user = this.getStoredUser();
            if (user && user.username === session) {
                this._isAuthenticated.set(true);
                this._currentUser.set(user.username);
            }
        }
    }

    isAuthenticated(): boolean {
        return this._isAuthenticated();
    }

    isRegistered(): boolean {
        return !!localStorage.getItem(AUTH_KEY);
    }

    getCurrentUser(): string | null {
        return this._currentUser();
    }

    async register(username: string, password: string): Promise<boolean> {
        if (!username.trim() || !password.trim()) return false;
        if (this.isRegistered()) return false;

        const passwordHash = await this.hash(password);
        const user: StoredUser = { username: username.trim(), passwordHash };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        this.setSession(username.trim());
        return true;
    }

    async login(username: string, password: string): Promise<boolean> {
        const user = this.getStoredUser();
        if (!user) return false;
        if (user.username !== username.trim()) return false;

        const passwordHash = await this.hash(password);
        if (user.passwordHash !== passwordHash) return false;

        this.setSession(username.trim());
        return true;
    }

    logout(): void {
        sessionStorage.removeItem(SESSION_KEY);
        this._isAuthenticated.set(false);
        this._currentUser.set(null);
    }

    private setSession(username: string): void {
        sessionStorage.setItem(SESSION_KEY, username);
        this._isAuthenticated.set(true);
        this._currentUser.set(username);
    }

    private getStoredUser(): StoredUser | null {
        const raw = localStorage.getItem(AUTH_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw) as StoredUser; } catch { return null; }
    }

    private async hash(value: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(value);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}
