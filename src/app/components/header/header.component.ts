import { CommonModule } from "@angular/common";
import { Component, OnInit, signal, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { ThemeService } from "../../services/theme.service";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { AuthService } from "../../services/auth.service";

interface AppMenuItem {
    href: string;
    label: string;
    icon: boolean;
}

@Component({
    selector: "app-header",
    standalone: true,
    imports: [CommonModule, RouterModule, TranslocoModule],
    templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit {
    private router = inject(Router);
    themeService = inject(ThemeService);
    private translateService = inject(TranslocoService);
    private authService = inject(AuthService);

    mobileMenuOpen = false;
    mobileSettingsOpen = false;

    navLinks: AppMenuItem[] = [];
    settingsLinks: AppMenuItem[] = [];
    
    settingsMenuOpen = false;

    theme = signal("light");

    get currentUser(): string | null {
        return this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.theme.set(this.themeService.getCurrentTheme()());
        this.translateService.selectTranslate("About").subscribe(_translation => {
            this.navLinks = [
                { href: "/", label: this.translateService.translate("Home"), icon: false },
                { href: "/triggers", label: this.translateService.translate("Triggers"), icon: false },
                { href: "/financial-impact", label: this.translateService.translate("Finances"), icon: false },
            ];
            
            this.settingsLinks = [
                { href: "/settings", label: this.translateService.translate("App Settings"), icon: false },
                { href: "/substances", label: this.translateService.translate("Substances"), icon: false },
                { href: "/triggers/management", label: this.translateService.translate("Triggers"), icon: false },
                { href: "/settings/backup", label: this.translateService.translate("Backup"), icon: false },
                { href: "/settings/sync", label: this.translateService.translate("Sync"), icon: false },
                { href: "/about", label: this.translateService.translate("About"), icon: false },
            ];
        })
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    isSettingsLinkActive(link: { href: string }): boolean {
        return this.router.isActive(link.href, true);
    }

    toggleTheme() {
        this.themeService.switchTheme();
    }

    isDarkMode() {
        return this.themeService.getCurrentTheme()() === "dark";
    }

    logout() {
        this.authService.logout();
        this.mobileMenuOpen = false;
        this.router.navigate(['/login']);
    }
}
